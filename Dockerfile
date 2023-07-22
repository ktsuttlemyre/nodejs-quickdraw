# Tips https://adambrodziak.pl/dockerfile-good-practices-for-node-and-npm
# Use the latest Node.js image as the base
FROM node:10.24.1-stretch as base

RUN echo "deb [check-valid-until=no] http://archive.debian.org/debian stretch main" > /etc/apt/sources.list.d/stretch.list
RUN echo "deb [check-valid-until=no] http://archive.debian.org/debian stretch-backports main" > /etc/apt/sources.list.d/stretch-backports.list
RUN rm -rf /etc/apt/sources.list
RUN echo "deb http://archive.debian.org/debian stretch main" /etc/apt/sources.list
RUN echo "deb http://archive.debian.org/debian stretch-updates main" /etc/apt/sources.list
RUN echo "deb http://archive.debian.org/debian-security stretch/updates main" /etc/apt/sources.list 
RUN apt-get -o Acquire::Check-Valid-Until=false update
RUN echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf
RUN apt-get update

RUN apt-get install -y --force-yes xauth git curl
#RUN apt-get install -y --force-yes fglrx
RUN apt-get install -y --force-yes xserver-xorg-core
RUN apt-get install -y --force-yes xserver-xorg
RUN apt-get install -y --force-yes xorg
RUN apt-get install -y --force-yes xorg openbox

RUN apt-get install -y --force-yes libjpeg-dev librsvg2-dev libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev build-essential g++
RUN export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig


#todo figure out how to remove build-essential and other dependencies after npm install
RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev --no-install-recommends \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g ts-node

# Set user and group
ARG user=user
ARG group=user
ARG uid=1000
ARG gid=1000

#RUN addgroup --system ${group} && \
#          adduser --gid ${gid} --system --disabled-login --disabled-password ${user}
# removed --no-create-home because npx or parcel needs a home directory

# Copy files as a non-root user. The `node` user is built in the Node image.
# enabling node (not root) user
WORKDIR /usr/src/app
RUN chown node:node ./

# Switch to user
#USER ${uid}:${gid}
USER node

# Set the working directory inside the container
WORKDIR /app
RUN chown -R ${USER}:${USER} /app

######################################################################
FROM base as builder

WORKDIR /app
# Install dependencies first, as they change less often than code.
COPY package*.json* ./
RUN npm ci && npm cache clean --force

#add default env vars
ENV ENV WIP
ENV NODE_MODULES /app/node_modules
ENV APP_LIBS /app/libs
ENV APP_STATIC /app/static
ENV APP_VIEWS /app/views

######################################################################
FROM builder as wip

# Defaults to production, docker-compose overrides this to development on build and run.
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Set the working directory inside the container
#mnt is expected to be local code volume
WORKDIR /app/mnt
# Expose the port on which your Node.js application will listen
EXPOSE 1234

RUN npm install -g nodemon@3.0.1

#using 2 instances of nodemon. One for compiling templates dir and one for any other project changes
#CMD ["nodemon", "--exec", "'npm run compile && nodemon ./index.js --ignore views/'", "--watch", "views/"]

CMD ["./entrypoint.sh"]

######################################################################
FROM builder as prod

# Defaults to production, docker-compose overrides this to development on build and run.
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Set the working directory inside the container
WORKDIR /app
# Expose the port on which your Node.js application will listen
EXPOSE 1234

# Copy the entire application code to the working directory
COPY --chown=${USER}:${USER} . .
RUN npx parcel build client/index.html

USER root
RUN chmod +x *.sh
USER node

#USE DEPLOYMENT RUNS TO SET THIS VAR
ENV ENV=UNSET


# Define the command to run your application
CMD ["./entrypoint.sh"]
