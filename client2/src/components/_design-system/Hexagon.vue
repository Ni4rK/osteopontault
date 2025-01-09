<template>
  <div class="hexagon-container">
    <div
      v-if="raised"
      class="hexagon-border"
      :style="{
        'width': `${width + 2}px`,
        'height': `${height + 2 * 1.1547}px`,
        'filter': `url(#${filterId})`
      }"
    ></div>
    <div
      class="hexagon-itself"
      :id="hexagonId"
      :style="{
        'width': `${width}px`,
        'height': `${height}px`,
        'filter': `url(#${filterId})`
      }"
    >
      <div class="hexagon-itself-slot">
        <slot></slot>
      </div>

      <!-- Apply border radius using a hidden SVG -->
      <svg class="hexagon-itself-filter" width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter :id="filterId">
            <feGaussianBlur in="SourceGraphic" :stdDeviation="borderRadius" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-facing-decorator";
import {ROSE_PHONE} from "@/utils/global.constants";
import PhoneHelper from "@shared/helpers/phone.helper";

@Component({
  name: 'op-hexagon'
})
export default class Hexagon extends Vue {
  static lastId = 0

  @Prop() width = 200
  @Prop() raised = false
  @Prop() image?: string
  @Prop() color?: string

  id = ++Hexagon.lastId

  mounted() {
    const hexagonStyle = document.head.appendChild(document.createElement("style"))
    if (this.image) {
      hexagonStyle.innerHTML = `#${this.hexagonId}::before {background-image: url(${this.image})}`
    } else if (this.color) {
      hexagonStyle.innerHTML = `#${this.hexagonId}::before {background-color: ${this.color}`
    }
  }

  get phone(): string {
    return `tel://${PhoneHelper.toFrenchNumber(ROSE_PHONE)}`
  }

  get height(): number {
    return this.width * 1.1547
  }

  get borderRadius(): number {
    return this.width * 0.05
  }

  get hexagonId(): string {
    return `hexagon-${this.id}`
  }

  get filterId(): string {
    return `hexagon-filter-${this.id}`
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
