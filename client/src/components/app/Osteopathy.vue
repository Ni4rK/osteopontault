<template>
  <v-card>
    <v-card-text>
      <v-tabs v-model="tab">
        <v-tab value="one">Qu'est-ce-que l'ostéopathie ?</v-tab>
        <v-tab value="two">Consulter à titre curatif</v-tab>
        <v-tab value="three">Consulter à titre préventif</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one">
          <div>
            C'est une thérapie manuelle qui se réfère à l'anatomie et à la physiologie.
            Ma formation de six ans en continu est agréé par le ministère de la santé.
            L'essentiel du travail de l'ostéopathe consiste à diagnostiquer et traiter par la main le point initial
            dysfonctionnel, amenant et expliquant le motif de consultation.
            Vous pouvez consulter un ostéopathe sans prescription médicale.

            Déroulement d'une séance séance de 45 minutes :
            <ul>
              <li>Entretien personnalisé avec le patient : sur son motif de consultation, ses habitudes de vie, ses
                antécédents.
              </li>
              <li>Test de toute la mécanique du corps par un examen palpatoire : identifier les pertes de mobilité et
                les tensions. On prend en charge le patient globalement.
              </li>
              <li>
                Traitement : Rétablir la mobilité des tissus et des articulations.
                J'agis aussi bien sur la structure par l'intermédiaire des muscles et des articulations que sur
                l'abdomen, le thorax et le crâne.
                Je pratique beaucoup aussi la fasciaethérapie. J'utilise des techniques qui sont adaptées à chaque
                patient, en fonction de son âge, de sa morphologie et de l'intensité de sa douleur.
              </li>
            </ul>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="two">
          <div>
            <ul>
              <li>Mal de dos : lombalgie cervicalgie, dorsalgie, torticolis</li>
              <li>Tendinite, entorse</li>
              <li>Remontées acides</li>
              <li>Ballonnements, constipation</li>
              <li>Stress, état, dépressif, insomnie</li>
              <li>Maux de tête : Céphalées de tension et migraine vertiges</li>
              <li>Bourdonnement d'oreille, blocage de la mâchoire</li>
              <li>Sciatique pubalgie, cruralgie</li>
              <li>Névralgie Servico, brachial, névralgie d'Arnold</li>
              <li>Troubles circulatoire</li>
            </ul>
            Par un traitement en dehors des phases aiguës, on peut parfois diminuer la répétition des :
            <ul>
              <li>Cystite et prostatite</li>
              <li>Bronchite rhinite, sinusite</li>
            </ul>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="three">
          <div>
            Il est conseillé de faire des bilans au moins une fois par an.
            <ul>
              <li>Pour les nouveau-nés : En cas de déformation crânienne ou torticolis, et même sans signes, pour faire
                un bilan qu'à la naissance est un processus qui constitue le premier traumatisme.
              </li>
              <li>Pour les enfants : Ayant une attitude de scoliotique pour éviter que celle-ci évolue en scoliose.</li>
              <li>Pour les adultes : Métier avec des mouvements répétés, port de charge, journée de travail, devant un
                ordinateur ou en voiture, debout à piétiner...
              </li>
              <li>Pour les seniors : Pour conserver une mobilité des articulations continue à marcher et prévenir
                l'arthrose.
              </li>
              <li>Pour les sportifs : Faire un bilan avant de démarrer une activité pour préparer une compétition et
                améliorer ses performances en acquérant de meilleures souplesse articulaires.
              </li>
              <li>Après un traumatisme : Accident de voiture, moto, vélo ou chute sur le crâne ou les fesses post
                entorse, déchirure ou fracture pouvant se répercuter sur tout l'équilibre du corps et entraîner avec le
                temps des douleurs à distance dans une autre partie du corps.
              </li>
              <li>Après une opération : Pour travailler les cicatrices qui aient aussi peuvent induire des tensions et
                des des douleurs à distance.
              </li>
              <li>Avant un accouchement : Traiter le bassin pour préparer la femme à l'accouchement.</li>
              <li>Après un accouchement : Rééquilibrer le corps et traiter les douleurs (coccyx).</li>
            </ul>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
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
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button}
})
export default class Osteopathy extends Vue {
  tab = null

  @Emit()
  closeIt() {
  }
}
</script>

<style lang="scss">

</style>
