<template>
  <div>
    <div v-if="!oculto">
      <p>{{ message }}</p>
    </div>
    <v-app-bar color="primary" dark>
      <!-- Titulo de NavBar -->
      <v-toolbar-title>Telefonia - Administrador</v-toolbar-title>

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
          <v-btn icon v-on="on" href="#usuarios">
            <v-icon>people</v-icon>
          </v-btn>
        </template>
        <span>Usuarios</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="logout">
            <v-icon left dark>exit_to_app</v-icon>
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

        <!-- div de listado de usuarios  -->
        <div id="usuarios">
          <v-container fluid>
            <v-card elevation="3" shaped>
              <!-- Titulo -->
              <v-row>
                <v-col cols="auto" class="mr-auto">
                  <v-card-title>Usuarios</v-card-title>
                </v-col>
                <v-col cols="auto">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        class="mx-2"
                        fab
                        dark
                        color="indigo"
                        v-on="on"
                        @click="createUser"
                      >
                        <v-icon dark>mdi-plus</v-icon>
                      </v-btn>
                    </template>
                    <span>Nuevo Usuario</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <!-- Fin de titulo -->

              <!-- Listado de usuarios -->
              <v-data-table
                :headers="headers"
                :items="users"
                :items-per-page="15"
                class="elevation-1"
              ></v-data-table>
              <!-- Fin de listado de usuarios -->
            </v-card>
          </v-container>
        </div>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment";

moment.locale("es");

export default {
  data: () => ({
    headers: [
      { text: "CUI", value: "cui" },
      { text: "Dirección", value: "direccion", sortable: false },
      { text: "Correo Electrónico", value: "email" },
      { text: "Nombre", value: "nombre" },
      { text: "Teléfono", value: "telefono" },
      { text: "Siguiente fecha de pago", value: "fecha_pagar" }
    ],
    users: [],
    user: {},
    oculto: true,
    message: ""
  }),

  beforeCreate() {
    if (!this.$session.exists()) {
      this.$router.push("/login");
    } else {
      const user = this.$session.get("user");
      if (user.rol_id !== 1) {
        this.$router.push("/");
      }
    }
  },

  async mounted() {
    this.user = this.$session.get("user");
    this.users = await this.getUsers();
  },

  methods: {
    logout: function() {
      this.$session.destroy();
      this.$router.push("/login");
    },

    createUser: async function() {
      let cui, email, nombre, direccion, telefono, total_pagar;

      const { value: formValues } = await Swal.fire({
        title: "Nuevo usuario",
        html: `
          <input
            id="cui"
            class="swal2-input"
            type="number"
            placeholder="CUI"
            required
          />
          <input
            id="nombre"
            class="swal2-input"
            type="text"
            placeholder="Nombre"
            required
          />
          <input
            id="direccion"
            class="swal2-input"
            type="text"
            placeholder="Direccion"
            required
          />
          <input
            id="email"
            class="swal2-input"
            type="email"
            placeholder="Email"
            required
          />
          <input
            id="telefono"
            class="swal2-input"
            type="number"
            placeholder="Telefono"
            required
          />
          <input
            id="total_pagar"
            class="swal2-input"
            type="number"
            placeholder="Total a pagar"
            required
          />
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Crear",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          return [
            (cui = document.getElementById("cui").value),
            (email = document.getElementById("email").value),
            (nombre = document.getElementById("nombre").value),
            (direccion = document.getElementById("direccion").value),
            (telefono = document.getElementById("telefono").value),
            (total_pagar = document.getElementById("total_pagar").value)
          ];
        }
      });

      if (formValues) {
        const URI = "http://localhost:4080/api/register";
        axios
          .post(URI, {
            cui,
            email,
            nombre,
            direccion,
            telefono,
            total_pagar
          })
          .then(async response => {
            if (response.status === 200) {
              this.users = await this.getUsers();
            }
          })
          .catch(error => {
            this.message = error;
          });
      }
    },

    getUsers: async function() {
      try {
        const response = await axios.get("http://localhost:4080/api/users");
        if (response.status == 200) {
          const users = response.data.map(user => {
            user.fecha_pagar = moment(user.fecha_pagar).format("LL");
            return user;
          });
          return users;
        }
      } catch (error) {
        this.message = error;
      }
      return [];
    }
  }
};
</script>
