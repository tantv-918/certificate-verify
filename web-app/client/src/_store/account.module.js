import { userService } from '../_services/user.service';
import router from '../router';

const user = JSON.parse(localStorage.getItem('user'));
const state = user ? { status: { loggedIn: true }, user } : { status: {}, user: null };

const actions = {
  login({ dispatch, commit }, { username, password }) {
    commit('loginRequest', { username });
    userService.login(username, password).then(
      (user) => {
        commit('loginSuccess', user);
        router.push('/');
      },
      (error) => {
        commit('loginFailure', error);
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  register({ dispatch, commit }, user) {
    commit('registerRequest', user);
    userService.register(user).then(
      (data) => {
        commit('registerSuccess');
        router.push('/login');
        setTimeout(() => {
          dispatch('alert/success', 'Registration successful', { root: true });
        });
      },
      (error) => {
        commit('registerFailure');
        dispatch('alert/error', error, { root: true });
      }
    );
  }
};

const mutations = {
  loginRequest(state, user) {
    state.status = { loggingIn: true };
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = { loggedIn: true };
    state.user = user;
  },
  loginFailure(state) {
    state.status = {};
    state.user = null;
  },
  registerRequest(state, user) {
    state.status = { registering: true };
  },
  registerSuccess(state) {
    state.status = {};
  },
  registerFailure(state) {
    state.status = {};
  }
};

export const account = {
  namespaced: true,
  state,
  actions,
  mutations
};
