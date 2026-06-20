FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY julindien/ /usr/share/nginx/html/julindien/
EXPOSE 80
