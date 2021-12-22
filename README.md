# EUFY Kinesis RSTP Integration

**Hypothesis**: Using AWS and open source libraries, I can stream and host my EUFY Camera(s) footage cheaper than Eufy's $3/month rate.

**Process**: Using AWS as a NAS (Network Attached Storage) proxy, I discovered a serverless Kinesis solution. By using gstreamer, an open-source video processing library, I was able to seemlessly take input of a EUFY camera's feed (via Real Time Streaming Protocol) and send it in real-time to AWS.

**Outcome**: I did it for cheaper and own my camera data!

## Tech Stack (processing):
* Docker - containerized deployment for scability across cameras
* Python - integration video library with camera feed
* [gstreamer](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/examples-gstreamer-plugin.html) - video library
* AWS
  * Kinesis Video Stream - serverless Kinesis solution

## Tech Stack (displaying and auth controls):
Implemented in [my website repo](https://github.com/ethanabowen/PersonalWebsite), used in this project.
* AWS
  * Amplify - website and some infrastructure management
    * Cognito Social IDP (Google)
    * Cognito Federated Auth flow
  * DynamoDB - user access table
  * Lambda - User CRUD and DynamoDB interations
  * API Gateway - Rest API for User CRUD
* GCP
  * OAuth2 Client

# Architecture
![Architecture](architecture.png)


# Files and Commands

## Processing
* ``docker_build.sh`` - build/update image with tag
* ``docker-compose up`` - spin up N containers pointing to image
* camera.py - receive video feed and send it to AWS Kinesis Video Streams (KVS)
* env_example.txt - example of env file.  See docker-compose.yml for naming/config information

## Auth Controls
* lambdas/cognito-authed-users.js - Custom User access-control based on DynamoDB User table
* lambdas/dynamo-invite-user.js - CRUD for Users in DynamoDB

# Lessons Learned
* Amplify is nice for demos, but difficult to work with and integrate into AWS SDK services.
* Amplify doesn't give ALL the controls of the services it provides.  With limit service settings, I found I had to edit the services manually (or IAM Roles) which is now NOT covered in the Cloud Formation document/stacks.