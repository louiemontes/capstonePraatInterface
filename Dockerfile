FROM node:8
WORKDIR /scaleBarWebService
COPY package.json /scaleBarWebService
RUN npm install
COPY . /scaleBarWebService
CMD npm start
EXPOSE 3000
