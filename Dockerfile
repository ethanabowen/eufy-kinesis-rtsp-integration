FROM ubuntu:18.04
RUN apt-get upgrade && \
    apt-get update && \
    apt-get install -y  \
    git
# ===== Setup Python Camera Repo ===== #
WORKDIR /opt/
RUN git clone https://github.com/ethanabowen/eufy-kinesis-rtsp-integration.git
WORKDIR /opt/eufy-kinesis-rtsp-integration/
RUN python3 camera.py



RUN cd /opt/
RUN python3 camera.py
