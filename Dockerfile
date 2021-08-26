# Setup Stage - set up the ZSH environment for optimal developer experience
FROM node:lts-alpine
# Let scripts know we're running in Docker (useful for containerised development)
ENV RUNNING_IN_DOCKER true
# Use the unprivileged `node` user (pre-created by the Node image) for safety (and because it has permission to install modules)
RUN mkdir -p /app \
    && chown -R node:node /app
# Set up ZSH and our preferred terminal environment for containers
RUN apk --no-cache add zsh curl git
RUN mkdir -p /home/node/.antigen
RUN curl -L git.io/antigen > /home/node/.antigen/antigen.zsh
# Use my starter Docker ZSH config file for this, or your own ZSH configuration file (https://gist.github.com/arctic-hen7/bbfcc3021f7592d2013ee70470fee60b)
COPY zsh-in-docker.sh /home/node/.zshrc
RUN chown -R node:node /home/node/.antigen /home/node/.zshrc
# Set up ZSH as the unprivileged user (we just need to start it, it'll initialise our setup itself)
USER node
RUN /bin/zsh /home/node/.zshrc
# Switch back to root for whatever else we're doing
# USER root

RUN mkdir /home/node/app && chown node:node /home/node/app
RUN mkdir /home/node/app/node_modules && chown node:node /home/node/app/node_modules
USER root
RUN chown node:node /usr/local/lib/node_modules
WORKDIR /home/node/app
RUN npm init -y && npm i -g @angular/cli

# RUN npm ci --quite
COPY --chown=node:node . .
USER node
# RUN cd .. && ng new app --strict=true
# COPY --chown=node:node package.json package-lock.json ./
# COPY --chown=node:node zsh-in-docker.sh ./
# USER root
# RUN /home/node/app/zsh-in-docker.sh \
#     -t https://github.com/denysdovhan/spaceship-prompt \
#     -a 'SPACESHIP_PROMPT_ADD_NEWLINE="false"' \
#     -a 'SPACESHIP_PROMPT_SEPARATE_LINE="false"' \
#     -p git \
#     -p https://github.com/zsh-users/zsh-autosuggestions \
#     -p https://github.com/zsh-users/zsh-completions \
#     -p https://github.com/zsh-users/zsh-history-substring-search \
#     -p https://github.com/zsh-users/zsh-syntax-highlighting
# ENTRYPOINT [ "/bin/zsh" ]
# CMD ["-l"]
