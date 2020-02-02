<template>
  <div>
    <div v-if="!oculto">
      <p>{{ message }}</p>
    </div>
    <v-app-bar color="green" dark>
      <!-- Titulo de NavBar -->
      <v-toolbar-title>Telefonia - Mi cuenta</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Inicio de botones de NavBar -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" href="#datos">
            <v-icon>account_circle</v-icon>
          </v-btn>
        </template>
        <span>Mis datos</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" href="#facturas">
            <v-icon>list_alt</v-icon>
          </v-btn>
        </template>
        <span>Mis facturas</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="logout">
            <v-icon dark>exit_to_app</v-icon>
          </v-btn>
        </template>
        <span>Salir</span>
      </v-tooltip>
      <!-- Fin de botones de Navbar -->
    </v-app-bar>

    <div class="my-4"></div>

    <v-content>
      <v-container fluid>
        <!-- div de datos del usuario -->
        <div id="datos">
          <v-container fill-height fluid grid-list-xl>
            <v-layout justify-center wrap>
              <v-flex>
                <v-card elevation="3" shaped>
                  <v-card-title>Mis Datos</v-card-title>
                  <v-form>
                    <v-container py-0>
                      <v-layout wrap>
                        <v-flex xs12 md6>
                          <v-text-field
                            label="CUI"
                            :v-model="user.cui"
                            :value="user.cui"
                            readonly
                          />
                        </v-flex>

                        <v-flex xs12 md6>
                          <v-text-field
                            label="Email"
                            :v-model="user.email"
                            :value="user.email"
                            readonly
                          />
                        </v-flex>

                        <v-flex xs12 md6>
                          <v-text-field
                            label="Nombre"
                            :v-model="user.nombre"
                            :value="user.nombre"
                            readonly
                          />
                        </v-flex>

                        <v-flex xs12 md6>
                          <v-text-field
                            label="Telefono"
                            :v-model="user.telefon"
                            :value="user.telefono"
                            readonly
                          />
                        </v-flex>

                        <v-flex xs12 md12>
                          <v-text-field
                            label="Direccion"
                            :v-model="user.direccion"
                            :value="user.direccion"
                            readonly
                          />
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-form>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
        <!-- Fin de datos del usuario -->

        <div class="my-6"></div>
        <v-divider></v-divider>
        <div class="my-6"></div>
        <div v-if="creando">
          <v-row class="fill-height" align-content="center" justify="center">
            <v-col class="subtitle-1 text-center" cols="12">
              Creando factura
            </v-col>
            <v-col cols="6">
              <v-progress-linear
                color="deep-purple accent-4"
                indeterminate
                rounded
                height="6"
              ></v-progress-linear>
            </v-col>
          </v-row>
        </div>

        <!-- div de listado de usuarios  -->
        <div id="facturas">
          <v-container fluid>
            <v-card elevation="3" shaped>
              <!-- Titulo -->
              <v-row>
                <v-col cols="auto" class="mr-auto">
                  <v-card-title>Facturas</v-card-title>
                </v-col>
                <v-col cols="auto">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        class="mx-2"
                        fab
                        dark
                        color="green"
                        v-on="on"
                        @click="createFactura"
                      >
                        <v-icon dark>create</v-icon>
                      </v-btn>
                    </template>
                    <span>Generar factura</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <!-- Fin de titulo -->

              <!-- Listado de facturas -->
              <v-data-table
                :headers="headers"
                :items="facturas"
                :items-per-page="10"
                class="elevation-1"
              >
                <template v-slot:item.action="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        class="mr-2"
                        v-on="on"
                        @click="getFactura(item)"
                      >
                        edit
                      </v-icon>
                    </template>
                    <span>Ver factura</span>
                  </v-tooltip>
                </template>
                <template v-slot:item.esta_pagado="{ item }">
                  <v-chip :color="getColor(item.esta_pagado)" dark>{{
                    item.esta_pagado
                  }}</v-chip>
                </template>
              </v-data-table>
              <!-- Fin de listado de facturas -->
            </v-card>
          </v-container>
        </div>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";

moment.locale("es");

export default {
  data() {
    return {
      headers: [
        { text: "Numero factura", value: "numero_factura" },
        { text: "Fecha de emision", value: "fecha_emision" },
        { text: "Fecha de vencimiento", value: "fecha_vencimiento" },
        { text: "Pago mensual", value: "pago_mensual" },
        { text: "Mora", value: "mora" },
        { text: "Total pagar", value: "total_pagar" },
        { text: "Estado", value: "esta_pagado" },
        { text: "Acciones", value: "action", sortable: false }
      ],
      facturas: [],
      user: {},
      creando: false,
      oculto: true,
      message: ""
    };
  },

  beforeCreate: function() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    } else {
      const user = this.$session.get("user");
      if (user.rol_id === 1) {
        this.$router.push("/admin");
      }
    }
  },

  async mounted() {
    this.user = this.$session.get("user");
    this.facturas = await this.getFacturas();
  },

  methods: {
    logout: function() {
      this.$session.destroy();
      this.$router.push("/login");
    },

    async getFacturas() {
      try {
        const response = await axios.get(
          `http://localhost:4080/api/mis-facturas/${this.user.cui}`
        );
        if (response.status == 200) {
          console.log(response.data);
          const facturas = response.data.map(factura => {
            factura.fecha_emision = moment(factura.fecha_emision).format("LL");
            factura.fecha_vencimiento = moment(
              factura.fecha_vencimiento
            ).format("LL");
            factura.esta_pagado = factura.esta_pagado ? "Pagado" : "No pagado";
            return factura;
          });
          console.log(facturas);
          return facturas;
        }
      } catch (error) {
        this.message = error;
      }
      return [];
    },

    getColor(pagado) {
      if (pagado === "Pagado") return "green";
      else return "red";
    },

    async createFactura() {
      const cui = this.user.cui;
      this.creando = true;
      if (cui) {
        try {
          const response = await axios.post(
            `http://localhost:4080/api/factura/create/${cui}`
          );
          this.creando = false;
          if (response.status === 200) {
            const filename = response.data.filename;
            if (filename) {
              window.location.href = filename;
            }
          }
        } catch (error) {
          this.creando = false;
          this.message = error;
        }
      } else {
        this.creando = false;
      }
    },

    getFactura(factura) {
      if (factura.ruta) {
        window.location.href = factura.ruta;
      }
    }
  }
};
</script>
