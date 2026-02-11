<template>
  <div class="login-wrap">
    <div
      class="login-window"
      :style="{
        boxShadow: `var(${'--el-box-shadow-dark'})`,
      }"
    >
  <h2 class="login-item">Sign In</h2>
      <el-form
        :model="loginData"
        label-width="70px"
        class="demo-dynamic"
      >
        <el-form-item
          prop="telephone"
          label="Account"
          :rules="[
            {
              required: true,
              message: 'Required.',
              trigger: 'blur',
            },
          ]"
        >
          <el-input v-model="loginData.telephone" />
        </el-form-item>
        <el-form-item
          prop="password"
          label="Password"
          :rules="[
            {
              required: true,
              message: 'Required.',
              trigger: 'blur',
            },
          ]"
        >
          <el-input type="password" v-model="loginData.password" />
        </el-form-item>
      </el-form>
      <div class="login-button-container">
        <el-button type="primary" class="login-btn" @click="handleLogin"
          >Sign In</el-button
        >
      </div>

      <div class="go-register-button-container">
  <button class="go-register-btn" @click="handleRegister">Sign Up</button>
  <button class="go-sms-btn" @click="handleSmsLogin">Sign in with Code</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
export default {
  name: "Login",
  setup() {
    const data = reactive({
      loginData: {
        telephone: "",
        password: "",
      },
    });
    const router = useRouter();
    const store = useStore();
    const handleLogin = async () => {
      try {
        if (!data.loginData.telephone || !data.loginData.password) {
          ElMessage.error("Please complete the login form.");
          return;
        }
        if (!checkTelephoneValid()) {
          ElMessage.error("Please enter a valid phone number.");
          return;
        }
	console.log(store.state.backendUrl, store.state.wsUrl);
        const response = await axios.post(
          store.state.backendUrl + "/login",
          data.loginData
        );
        console.log(response);
        if (response.data.code == 200) {
          if (response.data.data.status == 1) {
            ElMessage.error("This account is disabled. Please contact an administrator.");
            return;
          }
          try {
            ElMessage.success(response.data.message);
            if (!response.data.data.avatar.startsWith("http")) {
              response.data.data.avatar =
                store.state.backendUrl + response.data.data.avatar;
            }
            store.commit("setUserInfo", response.data.data);
            // Prepare to create the WebSocket connection
            const wsUrl =
              store.state.wsUrl + "/wss?client_id=" + response.data.data.uuid;
            console.log(wsUrl);
            store.state.socket = new WebSocket(wsUrl);
            store.state.socket.onopen = () => {
              console.log("WebSocket opened");
            };
            store.state.socket.onmessage = (message) => {
              console.log("Message received:", message.data);
            };
            store.state.socket.onclose = () => {
              console.log("WebSocket closed");
            };
            store.state.socket.onerror = () => {
              console.log("WebSocket error");
            };
            router.push("/chat/sessionlist");
          } catch (error) {
            console.log(error);
          }
        } else {
          ElMessage.error(response.data.message);
        }
      } catch (error) {
        ElMessage.error(error);
      }
    };
    const checkTelephoneValid = () => {
      return true;
    };
    const handleRegister = () => {
      router.push("/register");
    };
    const handleSmsLogin = () => {
      router.push("/smsLogin");
    };

    return {
      ...toRefs(data),
      router,
      handleLogin,
      handleRegister,
      handleSmsLogin,
    };
  },
};
</script>

<style>
.login-wrap {
  height: 100vh;
  background-color: #e6f4ff;
}

.login-window {
  background-color: rgb(255, 255, 255, 0.7);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px 50px;
  border-radius: 20px;
  /*opacity: 0.7;*/
}

.login-item {
  text-align: center;
  margin-bottom: 20px;
  color: #494949;
}

.login-button-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  margin-top: 20px; /* 可选，根据需要调整按钮与输入框之间的间距 */
  width: 100%;
}

.login-btn,
.login-btn:hover {
  background-color: rgb(229, 132, 132);
  border: none;
  color: #ffffff;
  font-weight: bold;
}

.go-register-button-container {
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;
}

.go-register-btn,
.go-sms-btn {
  background-color: rgba(255, 255, 255, 0);
  border: none;
  cursor: pointer;
  color: #d65b54;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  margin-left: 10px;
}

.el-alert {
  margin-top: 20px;
}
</style>
