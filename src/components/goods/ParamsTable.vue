<template>
  <el-table border stripe :data="data">
    <el-table-column type="expand">
      <template slot-scope="scope">
        <el-tag v-for="(item, i) in attrValList(scope.row.attr_vals)" :key="i">
          {{ item }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column type="index" label="#"></el-table-column>
    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-edit"
          @click="openEidt(scope.row)"
        >
          编辑
        </el-button>
        <el-button
          size="mini"
          type="danger"
          icon="el-icon-delete"
          @click="handleDeleteParams(scope.row)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: {
    data: []
  },
  methods: {
    attrValList(vals) {
      return vals ? vals.split(',') : []
    },
    handleDeleteParams(row) {
      this.$emit('handleDeleteParams', row)
    },
    openEidt(row) {
      this.$emit('openEidt', row)
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin-left: 10px;
}
</style>
