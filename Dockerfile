FROM node:16

COPY package.json yarn.lock ./

RUN yarn

RUN mkdir front && mkdir back

COPY front/package.json front
COPY front/yarn.lock front

COPY back/package.json back
COPY back/yarn.lock back

RUN cd front && yarn

RUN cd back && yarn

COPY front front

COPY back back

EXPOSE 3000

EXPOSE 4001

CMD ["yarn", "dev"]
