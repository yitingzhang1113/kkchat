<template>
  <router-view />
</template>

<script>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { ElMessage } from "element-plus";
export default {
  name: "App",
  setup() {
    const store = useStore();
    const router = useRouter();
    const getUserInfo = async () => {
      try {
        const req = {
          uuid: store.state.userInfo.uuid,
        };
        const rsp = await axios.post(
          store.state.backendUrl + "/user/getUserInfo",
          req
        );
        if (rsp.data.code == 200) {
          if (!rsp.data.data.avatar.startsWith("http")) {
            rsp.data.data.avatar = store.state.backendUrl + rsp.data.data.avatar;
          }
          store.commit("setUserInfo", rsp.data.data);
        } else {
          console.error(rsp.data.message);
        }
        console.log(rsp);
      } catch (error) {
        console.log(error);
      }
    };
    const logout = async () => {
      store.commit("cleanUserInfo");
      const req = {
        owner_id: store.state.userInfo.uuid,
      };
      const rsp = await axios.post(
        store.state.backendUrl + "/user/wsLogout",
        req
      );
      if (rsp.data.code == 200) {
        router.push("/login");
        ElMessage.success("Account is disabled. Logging out.");
      } else {
        ElMessage.error(rsp.data.message);
      }
    };
    onMounted(() => {
      if (store.state.userInfo.uuid) {
        getUserInfo();
        if (store.state.userInfo.status == 1) {
          logout();
        }
        const wsUrl =
          store.state.wsUrl + "/wss?client_id=" + store.state.userInfo.uuid;
        console.log(wsUrl);
        store.state.socket = new WebSocket(wsUrl);
        store.state.socket.onopen = () => {
          console.log("WebSocket opened");
          console.log("Signal server connected");
        };
        store.state.socket.onmessage = (message) => {
          console.log("Message received:", message.data);
        };
        store.state.socket.onclose = () => {
          console.log("WebSocket closed");
          console.log("Signal server disconnected");
        };
        store.state.socket.onerror = (event) => {
          console.log("WebSocket error");
          console.log("Signal server connection failed:", event);
        };
        console.log(store.state.socket);
      }
    });
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* 推荐使用，以确保布局计算的一致性 */
}
</style>