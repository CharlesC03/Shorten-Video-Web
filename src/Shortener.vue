<template>
  <div v-if="!state">
    <p>Loading...</p>
  </div>
  <div v-else>
    <p v-if="videoName != null">{{ videoName }}</p>
    <video v-if="video != null" width="500" :src="videoURL" controls></video><br />
    <input type="file" accept="video/*" @change="setVideo" />
    <div v-if="video != null">
      Output Name:<input type="text" v-model="outName" /><br />
      <p :style="{ color: fpsError.color }">
        Frame Rate: <input type="number" v-model="videoFPS" :placeholder="fpsError.ph" min="1" />
      </p>
      <button type="button" @click="toggleAdvanced">Advanced</button><br />
      <div v-if="showAdvanced">
        Frame Margin: <input type="number" v-model="frameMargin" /><br />
        Loundness Minimun: <input type="number" v-model="minVolume" step="0.01" min="0" max="1" />
      </div>
      <br />
      <div v-if="!runningShortening">
        <button type="button" @click="convertToShort">Shorten</button>
      </div>
      <div v-else>
        <p>{{ runMess }}</p>
      </div>
    </div>
  </div>
</template>
<script>
  import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
  const ffmpeg = createFFmpeg({ log: true });
  export default {
    data() {
      return {
        video: null,
        videoURL: null,
        videoName: null,
        videoFPS: '',
        audioURL: null,
        outFile: null,
        outName: null,
        frameMargin: 3, //Frame Margin
        minVolume: 0.03, //Any volume below this threshold will be cut from the video
        showAdvanced: false,
        state: false,
        runningShortening: false,
        hasRun: false,
        runMess: 'Running...',
        fpsError: {
          color: 'black',
          ph: '',
        },
        isActive: false,
      };
    },
    methods: {
      setVideo(e) {
        if (e.target.files?.item(0) != null) {
          this.video = e.target.files?.item(0);
          this.videoURL = URL.createObjectURL(this.video);
          this.videoName = this.video.name;
          const videoName = this.videoName;
          let temp;
          if (this.videoName.search('[.]') != -1) {
            temp = this.videoName.split('.');
            temp[temp.length - 2] += '_shortened';
            temp = temp.join('.');
          } else {
            temp = `${this.videoName}_shortened.mp4`;
          }
          this.outName = temp;
        }
      },
      toggleAdvanced() {
        this.showAdvanced = !this.showAdvanced;
      },
      async convertToShort() {
        if (this.videoFPS.length == 0) {
          this.fpsError = {
            color: 'red',
            ph: 'Required',
          };
        } else {
          this.fpsError = {
            color: 'black',
            ph: '',
          };
          this.runningShortening = true;
          ffmpeg.FS('writeFile', 'temp.mp4', await fetchFile(this.video));
          this.runMess = 'Extracting Audio...';
          await ffmpeg.run('-i', 'temp.mp4', 'temp_audio.wav');
          var audioContext = new AudioContext();
          var analysis = audioContext.createAnalyser();
          var audioInfo = await audioContext.decodeAudioData(ffmpeg.FS('readFile', 'temp_audio.wav').buffer);
          console.log(audioInfo);
          var array = await ffmpeg.FS('readFile', 'temp_audio.wav');
          analysis.getByteTimeDomainData(array);
          var max = 0;
          var min = 0;
          for (var i = 0; i < array.byteLength * 4; i++) {
            if (array[i] > max) {
              max = array[i];
            } else if (array[i] < min) {
              min = array[i];
            }
          }
          console.log({ max, min });
          console.log(analysis.fftSize);
          console.log(array);
          this.hasRun = true;
          this.runningShortening = false;
          this.runMess = 'Running...';
        }
      },
    },
    created: async function () {
      await ffmpeg.load();
      this.state = true;
    },
  };
</script>

<style>
  .Error {
    color: rgb(196, 16, 16);
  }
  .activeClass {
    color: aquamarine;
  }
  .errorClass {
    color: brown;
  }
</style>
