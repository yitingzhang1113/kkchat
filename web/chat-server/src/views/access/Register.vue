<template>
  <div class="register-wrap">
    <div
      class="register-window"
      :style="{
        boxShadow: `var(${'--el-box-shadow-dark'})`,
      }"
    >
  <h2 class="register-item">Sign Up</h2>
      <el-form
        ref="formRef"
        :model="registerData"
        label-width="70px"
        class="demo-dynamic"
      >
        <el-form-item
          prop="nickname"
          label="Nickname"
          :rules="[
            {
              required: true,
              message: 'Required.',
              trigger: 'blur',
            },
            {
              min: 3,
              max: 10,
              message: 'Nickname must be 3 to 10 characters.',
              trigger: 'blur',
            },
          ]"
        >
          <el-input v-model="registerData.nickname" />
        </el-form-item>
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
          <el-input v-model="registerData.telephone" />
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
          <el-input type="password" v-model="registerData.password" />
        </el-form-item>
        <el-form-item
          prop="sms_code"
          label="Verification Code"
          :rules="[
            {
              required: true,
              message: 'Required.',
              trigger: 'blur',
            },
          ]"
        >
          <el-input v-model="registerData.sms_code" style="max-width: 200px">
            <template #append>
              <el-button
                @click="sendSmsCode"
                style="background-color: rgb(229, 132, 132); color: #ffffff"
                >Send Code</el-button
              >
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="register-button-container">
        <el-button type="primary" class="register-btn" @click="handleRegister"
          >Sign Up</el-button
        >
      </div>
      <div class="go-login-button-container">
        <button class="go-sms-login-btn" @click="handleSmsLogin">
          Sign in with Code
        </button>
        <button class="go-password-login-btn" @click="handleLogin">
          Sign in with Password
        </button>
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
  name: "Register",
  setup() {
    const data = reactive({
      registerData: {
        telephone: "",
        password: "",
        nickname: "",
        sms_code: "",
      },
    });
    const router = useRouter();
    const store = useStore();
    const handleRegister = async () => {
      try {
        if (
          !data.registerData.nickname ||
          !data.registerData.telephone ||
          !data.registerData.password ||
          !data.registerData.sms_code
        ) {
          ElMessage.error("Please complete the registration form.");
          return;
        }
        if (
          data.registerData.nickname.length < 3 ||
          data.registerData.nickname.length > 10
        ) {
          ElMessage.error("Nickname must be 3 to 10 characters.");
          return;
        }
        if (!checkTelephoneValid()) {
          ElMessage.error("Please enter a valid phone number.");
          return;
        }
        const response = await axios.post(
          store.state.backendUrl + "/register",
          data.registerData
  ); // Send POST request
        if (response.data.code == 200) {
          ElMessage.success(response.data.message);
          console.log(response.data.message);
          // Check whether the avatar has an http prefix
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
        } else {
          ElMessage.error(response.data.message);
          console.log(response.data.message);
        }
      } catch (error) {
        ElMessage.error(error);
        console.log(error);
      }
    };
    const checkTelephoneValid = () => {
      return true;
    };

    const handleLogin = () => {
      router.push("/login");
    };

    const handleSmsLogin = () => {
      router.push("/smsLogin");
    };

    const sendSmsCode = async () => {
      if (
        !data.registerData.telephone ||
        !data.registerData.nickname ||
        !data.registerData.password
      ) {
  ElMessage.error("Please complete the registration form.");
        return;
      }
      if (!checkTelephoneValid()) {
  ElMessage.error("Please enter a valid phone number.");
        return;
      }
      const req = {
        telephone: data.registerData.telephone,
      };
      const rsp = await axios.post(
        store.state.backendUrl + "/user/sendSmsCode",
        req
      );
      console.log(rsp);
      if (rsp.data.code == 200) {
        ElMessage.success(rsp.data.message);
      } else if (rsp.data.code == 400) {
        ElMessage.warning(rsp.data.message);
      } else {
        ElMessage.error(rsp.data.message);
      }
    };

    return {
      ...toRefs(data),
      router,
      handleRegister,
      handleLogin,
      handleSmsLogin,
      sendSmsCode,
    };
  },
};
</script>

<style>
.register-wrap {
  height: 100vh;
  background-color: #e6f4ff;
}

.register-window {
  background-color: rgb(255, 255, 255, 0.7);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px 50px;
  border-radius: 20px;
}

.register-item {
  text-align: center;
  margin-bottom: 20px;
  color: #494949;
}

.register-button-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  margin-top: 20px; /* 可选，根据需要调整按钮与输入框之间的间距 */
  width: 100%;
}

.register-btn,
.register-btn:hover {
  background-color: rgb(229, 132, 132);
  border: none;
  color: #ffffff;
  font-weight: bold;
}

.el-alert {
  margin-top: 20px;
}

.go-login-button-container {
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;
}

.go-sms-login-btn,
.go-password-login-btn {
  background-color: rgba(255, 255, 255, 0);
  border: none;
  cursor: pointer;
  color: #d65b54;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  margin-left: 10px;
}
</style>