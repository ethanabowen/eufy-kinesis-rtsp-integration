# ===== Download OS ===== #
FROM ubuntu:18.04

# ===== Download Dependences ===== #
RUN apt-get upgrade && \
    apt-get update && \
    apt-get install -y  \
    byacc \
    cmake \
    g++ \
    git \
    gstreamer1.0-plugins-base-apps \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-ugly \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    python3 \
    pkg-config \
    xz-utils && \
    rm -rf /var/lib/apt/lists/*

# ===== Setup Kinesis Video Streams Producer SDK (CPP) ===== #
WORKDIR /opt/
RUN git clone https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
WORKDIR /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/
RUN cmake .. -DBUILD_GSTREAMER_PLUGIN=ON &&\
    make

ENV JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-amd64/
ENV LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib:$LD_LIBRARY_PATH
ENV GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build


# ===== Setup Python Camera Repo ===== #
ADD ./camera.py /opt/eufy-kinesis-rtsp-integration/
WORKDIR /opt/eufy-kinesis-rtsp-integration/