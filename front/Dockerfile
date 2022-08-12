FROM node:16
COPY . .
EXPOSE 3000
RUN yarn
RUN yarn build
CMD ["yarn", "serve"]