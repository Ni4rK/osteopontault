<template>
  <v-card>
    <v-card-title>
      Infos pratiques
    </v-card-title>
    <v-card-text>
      <div class="Infos">
        <div class="Infos-item">
          <Location/>
        </div>
        <div class="Infos-item">
          <Phone/>
        </div>
        <div class="Infos-item">
          <v-icon start icon="mdi-currency-eur"/>
          <span>Paiement par chèque ou espèces — pas de CB</span>
        </div>
        <div class="Infos-item">
          <v-icon start icon="mdi-thumb-up"/>
          <span>Conventionné pour remboursement mutuelle</span>
        </div>
        <div class="Infos-item">
          <v-icon start icon="mdi-car"/>
          <span>Parking et services à proximité (pharmacie, poissonnerie, boulangerie, ...)</span>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <Button
        :active="true"
        label="Ok" @click="closeIt()"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {Component, Emit, Vue} from "vue-facing-decorator";
import Phone from "@/components/_design-system/Phone.vue";
import Location from "@/components/_design-system/Location.vue";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button, Location, Phone}
})
export default class Infos extends Vue {
  @Emit()
  closeIt() {
  }
}
</script>

<style lang="scss">
.Infos {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .pi {
    margin-right: 1rem;
  }

  &-item {
    display: flex;
    align-items: center;
  }
}
</style>
