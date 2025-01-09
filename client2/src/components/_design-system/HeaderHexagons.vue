<template>
  <div class="Header-hexagons">
    <Hexagon
      :width="100"
      :raised="true"
      image="images/osteo4.jpg"
      style="transform: translateX(20px) translateY(0px)"
    />
    <Hexagon
      :width="120"
      :raised="true"
      image="images/osteo2.jpg"
      style="z-index: 10; transform: translateX(-0px) translateY(30px)"
    />
    <Hexagon
      :width="100"
      :raised="true"
      image="images/osteo3.jpg"
      style="transform: translateX(-20px) translateY(-10px)"
    />
    <div style="z-index: 10; transform: translateX(20px) translateY(-30px)">
      <Hexagon
        :width="200"
        :raised="true"
        image="images/rose.jpg"
      />
      <div class="text-center font-weight-bold" style="transform: translateY(20px)">
        Roselyne LEAN
      </div>
    </div>
    <div style="transform: translateX(5px) translateY(-10px)">
      <Hexagon
        :width="180"
        :raised="true"
        image="images/anais.jpg"
      />
      <div class="text-center font-weight-bold" style="transform: translateY(10px);">
        Anais DE CARVALHO
      </div>
    </div>
    <Hexagon
      :width="100"
      :raised="true"
      image="images/osteo5.jpg"
      style="transform: translateX(45px) translateY(0px)"
    />
    <Hexagon
      :width="120"
      :raised="true"
      image="images/osteo6.jpg"
      style="z-index: 10; transform: translateX(25px) translateY(-20px)"
    />
    <Hexagon
      :width="100"
      :raised="true"
      image="images/osteo7.jpg"
      style="z-index: 5; transform: translateX(5px) translateY(20px)"
    />
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-facing-decorator";
import Hexagon from "@/components/_design-system/Hexagon.vue";

@Component({
  components: {Hexagon}
})
export default class HeaderHexagons extends Vue {
}
</script>
