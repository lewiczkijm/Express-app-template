
// axios.defaults.validateStatus = (e) => e >=200 && e <500

var userInfo = new Vue({
	el:"#user",
	template:`

<div>
	<div v-if="isLogin">
		{{user.name}}
		<a href="" @click.prevent="logout" >Выход</a>
	</div>
	<div v-else>

		<input   type="text"   v-model.lazy="login"   id="login" >
		<label   for="login" >логин</label>


		<input   type="password"   v-model.lazy="password"   id="password">
		<label   for="password">пароль</label>
		

		<input   type="checkbox"   v-model="save"   id="save">
		<label   for="save">сохранить меня</label>


		<button   @click="auth">Войти</button>

	</div>

	<modal 
		v-if="modalMessage" 
		@close="modalMessage=''"
		title="Сообщение"
		border="rgb(245, 198, 203)"
		background="rgb(248, 215, 218)"
		color="rgb(114, 28, 36)"
	>
		{{modalMessage}}
	</modal>

</div>

`,
	data:{
		user:USER,
		login:"",
		password:"",
		save:"",
		modalMessage:""
	},
	methods:{
		 
		async auth(){

			axios.post(
				"/api/login",
				{
					login: this.login,
					password: this.password,
					save: this.save
				}
			).
			
			then(auth=>{
				if(auth.status === 200) document.location.href = '/lk'
				else throw new Error("Wrong request")
			}).
			
			catch(err=>{
				if(err.response === undefined || err.response.status !== 400)
					this.modalMessage = "server error - reload page or repeat later"
				else 
					this.modalMessage = err.response.data.message
			})
		},

		async logout(){

			axios.get("/api/user/logout").
			then(exitData=>{
				if(exitData.status === 200) document.location.href = '/'
				else throw new Error("Wrong request")
			}).
			catch(err=>{
				this.modalMessage = "server error - reload page or repeat later"
			})			
		},
	},
	computed:{
		isLogin(){
			return this.user.name !== undefined
		}
	},
	components:{
		'modal':modal
	}
}) 