<template>
  <el-container class="home-container">
    <el-header class="home-header">
      <div>
        <img src="../assets/heima.png" alt="" />
        <span> 电商后台管理系统 </span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '60px' : '200px'">
        <div class="collapse-box" @click="collapseChange">
          <div :class="isCollapse ? '' : 'collapsed'">|||</div>
        </div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
        >
          <!-- 菜单 -->
          <el-submenu
            v-for="menu in menus"
            :key="menu.id"
            :index="menu.id + ''"
          >
            <template slot="title">
              <i :class="iconMap[menu.id]"></i>
              <span>{{ menu.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="item in menu.children"
              :key="item.id"
              :index="'/' + item.path"
            >
              <template>
                <i class="el-icon-menu"></i>
                <span>{{ item.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { API } from '@/config/config'
export default {
  name: 'Home',
  data() {
    return {
      menus: [],
      iconMap: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false
    }
  },

  created() {
    this.getMenus()
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenus() {
      const { data: res } = await this.$http.get(API.getMenus)
      console.log('this.menus', res.data)
      if (res.meta.status !== 200) {
        this.$message.error('获取菜单失败')
      }
      this.menus = res.data
    },
    collapseChange() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
}

.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}

.home-header {
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  color: #fff;
  align-items: center;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    > span {
      margin-left: 15px;
    }
  }
}
.iconfont {
  margin-right: 10px;
}
.el-menu {
  border-right: none;
}
.collapse-box {
  background-color: #4a5064;
  color: #fff;
  text-align: center;
  margin: 0 auto;
  cursor: pointer;
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.1rem;
}
.collapsed {
  transform: rotate(90deg);
}
</style>
