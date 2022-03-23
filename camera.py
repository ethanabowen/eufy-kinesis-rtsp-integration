import os
import sys
import subprocess

CAMERA_USER = os.getenv('CAMERA_USER')
CAMERA_PASSWORD = os.getenv('CAMERA_PASSWORD')
CAMERA_IP = os.getenv('CAMERA_IP')
LATENCY = os.getenv('LATENCY')
FRAME_RATE = os.getenv('FRAME_RATE')
KVS_STREAM_NAME = os.getenv('KVS_STREAM_NAME')
AWS_IAM_ACCESS_KEY = os.getenv('AWS_IAM_ACCESS_KEY')
AWS_IAM_SECRET_KEY = os.getenv('AWS_IAM_SECRET_KEY')
AWS_REGION = os.getenv('AWS_REGION')


### Command Builder Functions ###


def build_kvs_sink_command(stream_name, access_key, secret_key, region):
    return "kvssink stream-name='{stream_name}' storage-size=512 access-key='{access_key}' secret-key='{secret_key}' aws-region='{region}'" \
        .format(stream_name=stream_name, access_key=access_key, secret_key=secret_key, region=region)


def build_video_settings(frame_rate):
    return "video/x-h264, format=avc,alignment=au, width=1920, height=1080, framerate={frame_rate}/1" \
        .format(frame_rate=frame_rate)


def build_rtsp_command(rtspUrl, latency, video_settings, kvs_sink_command):
    return "gst-launch-1.0 rtspsrc location='{rtspUrl}' short-header=TRUE latency={latency} ! rtph264depay ! {video_settings} ! {kvs_sink_command}" \
        .format(rtspUrl=rtspUrl, latency=latency, video_settings=video_settings, kvs_sink_command=kvs_sink_command)


def build_rtsp_url(user, password, ip):
    if(user is None and password is None):
        return "rtsp://{ip}/live0".format(user=user, password=password, ip=ip)

    return "rtsp://{user}:{password}@{ip}/live0".format(user=user, password=password, ip=ip)


video_settings = build_video_settings(FRAME_RATE)
rtsp_url = build_rtsp_url(CAMERA_USER, CAMERA_PASSWORD, CAMERA_IP)
kvs_sink_command = build_kvs_sink_command(
    KVS_STREAM_NAME, AWS_IAM_ACCESS_KEY, AWS_IAM_SECRET_KEY, AWS_REGION)

# build 'gst-launch-1.0 rtspsrc' command with ENV
cmd = build_rtsp_command(rtsp_url, LATENCY, video_settings, kvs_sink_command)

# ./kvs_log_configuration
while(True):
    print('\n\n###### While Build Command: ######\n', cmd)
    os.system(cmd)
    #subprocess.run(cmd, shell=True, stdin=sys.stdin, stdout=subprocess.STDOUT, stderr=sys.stderr).returncode

    # CloudWatch alarm when failure!
