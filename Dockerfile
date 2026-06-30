# ---- NovaCorp Intranet Portal Docker Image ----
FROM nginx:1.27-alpine

LABEL maintainer="IT-DevOps@novacorp.local"
LABEL description="Company Intranet Portal - static site served via nginx"

# Remove default config and copy custom one (adds /health and /nginx_status)
RUN rm /etc/nginx/conf.d/default.conf
COPY src/nginx.conf /etc/nginx/conf.d/default.conf

# Copy website source
COPY src/index.html /usr/share/nginx/html/index.html
COPY src/css /usr/share/nginx/html/css
COPY src/js /usr/share/nginx/html/js
COPY src/images /usr/share/nginx/html/images

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
