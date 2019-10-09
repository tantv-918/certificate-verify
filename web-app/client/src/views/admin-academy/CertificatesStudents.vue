<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Danh Sách Học Viên Của Môn Học</h1>
      <div class="card shadow mb-4">
        <div class="card-header py-3"></div>
        <div class="card-body">
          <div class="table-responsive">
            <b-table
              show-empty
              stacked="md"
              :items="blogPosts"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="name" slot-scope="row">{{ row.item.name }}</template>

              <template slot="Username" slot-scope="row">{{ row.item.Username }}</template>
              <template slot="more">...</template>

              <template slot="delete" slot-scope="row">
                <div class="row justify-content-center">
                  <div class="col-4 padding-0">
                    <b-button
                      @click="info(row.item, row.index, $event.target)"
                      class="mr-1 float-right btn-circle btn-sm"
                      variant="info"
                      :id="`popover-info-${row.item.Username}`"
                    >
                      <b-popover
                        :target="`popover-info-${row.item.Username}`"
                        triggers="hover"
                        placement="top"
                      >Chi Tiết</b-popover>
                      <i class="fas fa-info-circle"></i>
                    </b-button>
                  </div>
                  <div class="col-4 padding-0">
                    <b-button
                      variant="success"
                      @click="confirmCertificate(row.item)"
                      class="float-left btn-circle btn-sm"
                      :id="`popover-confirm-${row.item.Username}`"
                      v-if="!row.item.statusConfirm"
                    >
                      <b-popover
                        :target="`popover-confirm-${row.item.Username}`"
                        triggers="hover"
                        placement="top"
                      >Xác nhận</b-popover>
                      <i class="fas fa-check-circle"></i>
                    </b-button>
                    <b-button
                      variant="info"
                      v-if="row.item.statusConfirm"
                      disabled="disabled"
                      class="btn-confirm-certificate"
                    >Confirmed</b-button>
                  </div>
                </div>
              </template>
            </b-table>
          </div>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="blogPosts.length"
                :per-page="perPage"
                v-model="currentPage"
                class="my-0"
              />
            </b-col>
          </b-row>
        </div>
      </div>
    </div>

    <b-modal
      :id="infoModal.Username"
      :total="infoModal.total"
      @hide="resetInfoModalDetail"
      title="Cập Nhật Môn Học"
      ok-only
      ok-variant="secondary"
      ok-title="Cancel"
    >
      <b-form>
        <b-form-group id="input-group-1" label-for="input-1">
          <div class="row">
            <div class="col-4">
              <h6>Name:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ student.name }}</h5>
            </div>
          </div>
        </b-form-group>
        <b-form-group id="input-group-2" label-for="input-2">
          <div class="row">
            <div class="col-4">
              <h6>Username:</h6>
            </div>
            <div class="col-8 text-left">
              <h5>{{ student.Username }}</h5>
            </div>
          </div>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      student: {
        name: ""
      },
      infoModal: {
        id: "info-modal",
        total: ""
      },
      blogPosts: [
        {
          Username: "student01",
          Fullname: "helloworld "
        },
        {
          Username: "student02",
          Fullname: "helloworld"
        }
      ],
      fields: [
        {
          key: "name",
          label: "Name",
          class: "text-center",
          sortable: true
        },
        {
          key: "Username",
          label: "Username",
          class: "text-center",
          sortable: true
        },
        {
          key: "more",
          label: "...",
          class: "text-center",
          sortable: true
        },
        {
          key: "delete",
          label: "Actions",
          class: "text-center",
          sortable: true
        }
      ],
      currentPage: 1,
      perPage: 12,
      pageOptions: [12, 24, 36]
    };
  },
  methods: {
    info(item, index, button) {
      this.student.name = item.name;
      this.student.Username = item.Username;
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    resetInfoModalDetail() {
      this.student.name = "";
    },
    confirmCertificate(item) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#28a745",
        confirmButtonText: "Yes, Confirm The Certificate!",
        reverseButtons: true
      }).then(result => {
        if (result.value) {
          this.$swal(
            "Confirmed!",
            "The certificate has been confirmed .",
            "success"
          );
        }
      });
    }
  }
};
</script>
