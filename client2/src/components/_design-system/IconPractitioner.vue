<template>
  <Hexagon
    :width="width"
    :image="image"
  />
</template>

<script lang="ts">
import {Practitioner} from "@shared/types/practitioner.enum";
import {Prop, Vue} from "vue-facing-decorator";
import {Component} from "vue-facing-decorator";
import Hexagon from "@/components/_design-system/Hexagon.vue";

@Component({
  components: {Hexagon}
})
export default class PractitionerIconComponent extends Vue {
  @Prop({ required: true }) practitioner!: Practitioner
  @Prop({ default: 20 }) width!: number

  get image(): string {
    switch (this.practitioner) {
      case Practitioner.ANAIS:
        return "images/anais.jpg"
      default:
        return "images/rose.jpg"
    }
  }
}
</script>

<style lang="scss">
$path: 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%;

.hexagon-container {
  display: flex;
  position: relative;
}

.hexagon-itself {
  position: relative;
  display: inline-block;
  color: lightgrey;

  &:before {
    content: "";
    display: block;
    padding-top: 115%;
    background: currentColor;
    -webkit-clip-path: polygon($path);
    clip-path: polygon($path);
    background-size: cover;
    background-repeat: no-repeat;
  }

  &-slot {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  &-filter {
    visibility: hidden;
    position: absolute;
  }
}

.hexagon-border {
  position: absolute;
  display: inline-block;
  color: black;

  &:before {
    content: "";
    display: block;
    padding-top: 115%;
    background: currentColor;
    -webkit-clip-path: polygon($path);
    clip-path: polygon($path);
    filter: url(#hexagon);
  }
}
</style>
