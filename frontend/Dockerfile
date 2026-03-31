
FROM httpd:2.4-alpine

RUN apk add --no-cache \
    openssl \
    bash \
    ca-certificates

RUN mkdir -p /etc/apache2/certs

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/apache2/certs/server.key \
    -out /etc/apache2/certs/server.crt \
    -subj "/C=CO/ST=Bogota/L=Bogota/O=ECI/CN=localhost"

RUN sed -i \
    -e 's/^#LoadModule ssl_module/LoadModule ssl_module/' \
    -e 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' \
    -e 's/^#LoadModule proxy_module/LoadModule proxy_module/' \
    -e 's/^#LoadModule proxy_http_module/LoadModule proxy_http_module/' \
    -e 's/^#LoadModule deflate_module/LoadModule deflate_module/' \
    -e 's/^#LoadModule headers_module/LoadModule headers_module/' \
    /usr/local/apache2/conf/httpd.conf

COPY index.html /usr/local/apache2/htdocs/
COPY auth.js /usr/local/apache2/htdocs/
COPY style.css /usr/local/apache2/htdocs/

COPY httpd-ssl.conf /usr/local/apache2/conf/extra/httpd-ssl.conf

RUN echo "Include conf/extra/httpd-ssl.conf" >> /usr/local/apache2/conf/httpd.conf

EXPOSE 443
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD nc -zv localhost 443 || exit 1

CMD ["httpd-foreground"]

