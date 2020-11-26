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
      <button type="button" @click="toggleAdvanced">Advanced</button><br />
      <div v-if="showAdvanced">
        Frame Margin: <input type="number" v-model="frameMargin" /><br />
        Loundness Minimun: <input type="number" v-model="minVolume" step="0.01" min="0" max="1" />
      </div>
      <br />
      <button type="button">Shorten</button>
    </div>
  </div>
</template>
<script>
  import { createFFmpeg } from '@ffmpeg/ffmpeg';
  const ffmpeg = createFFmpeg({ log: true });
  export default {
    data() {
      return {
        video: null,
        videoURL: null,
        videoName: null,
        outFile: null,
        outName: null,
        frameMargin: 3, //Frame Margin
        minVolume: 0.03, //Any volume below this threshold will be cut from the video
        showAdvanced: false,
        state: false,
      };
    },
    methods: {
      setVideo(e) {
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
      },
      toggleAdvanced() {
        this.showAdvanced = !this.showAdvanced;
      },
    },
    created: async function () {
      await ffmpeg.load();
      this.state = true;
    },
  };
</script>
