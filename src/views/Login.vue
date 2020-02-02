<template>
  <v-app id="inspire">
    <div v-if="!oculto">
      <p>{{ message }}</p>
    </div>
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="5">
            <v-alert
              v-if="error"
              :value="true"
              color="error"
              icon="warning"
              outline
              v-text="errorMessages"
            />
            <v-card class="elevation-12">
              <v-toolbar>
                <v-toolbar-title>Login - Telefonia</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form @submit.prevent="login" method="post">
                  <v-text-field
                    id="email"
                    label="Email"
                    name="email"
                    prepend-icon="email"
                    v-model="email"
                    required
                    :error-messages="emailErrors"
                    @input="$v.email.$touch()"
                    @blur="$v.email.$touch()"
                    type="email"
                  />

                  <v-text-field
                    prepend-icon="lock"
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    v-model="password"
                    required
                    :error-messages="passwordErrors"
                    @input="$v.password.$touch()"
                    @blur="$v.password.$touch()"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" type="submit" @click="submit"
                  >Entrar</v-btn
                >
                <v-btn color="green lighten-5" @click="clear">Limpiar</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import axios from "axios";
import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";

export default {
  name: "login",

  mixins: [validationMixin],

  validations: {
    email: { required, email },
    password: { required }
  },

  data: () => ({
    email: "",
    password: "",
    error: false,
    errorMessages: "",
    oculto: true,
    message: ""
  }),

  computed: {
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) {
        return errors;
      }
      !this.$v.password.required && errors.push("Campo obligatorio.");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) {
        return errors;
      }
      !this.$v.email.email &&
        errors.push("Debe ser un correo electrónico válido.");
      !this.$v.email.required && errors.push("Campo obligatorio.");
      return errors;
    }
  },

  beforeCreate: function() {
    if (this.$session.exists()) {
      const user = this.$session.get("user");
      if (user.rol_id === 1) {
        this.$router.push("/admin");
      } else {
        this.$router.push("/");
      }
    }
  },

  methods: {
    submit() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      const URI = "http://localhost:4080/api/login";

      axios
        .post(URI, {
          email: this.email,
          password: this.password
        })
        .then(response => {
          if (response.status === 200) {
            const user = response.data;
            this.error = false;
            this.$session.start();
            this.$session.set("user", user);
            if (user.rol_id === 1) {
              this.$router.push("/admin");
              this.clear();
            } else {
              this.$router.push("/");
              this.clear();
            }
          }
        })
        .catch(error => {
          this.message = error;
          this.errorMessages =
            "Se produjo un error, no se puede iniciar sesión con estas credenciales.";
          this.password = "";
          this.error = true;
        });
    },

    clear() {
      this.$v.$reset();
      this.email = "";
      this.password = "";
      this.error = false;
    }
  }
};
</script>
