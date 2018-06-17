var passwordUpdate = new Vue({
	el:'#updatePassword',
	template:`
<div>
	<h3>Изменить пароль</h3>

	<label for="oldpass">Старый пароль</label>
	<input type=password id="oldpass" v-model.lazy="oldpass">

	<label for="newpass">Новый пароль</label>
	<input type=password id="newpass" v-model.lazy="newpass">

	<button @click="renew">Изменить</button>
	<modal 
		title = "Сообщение"
		v-show="msg" 
		@close="msg=''"
		:border="dialogStyle.border"
		:background="dialogStyle.background"
		:color="dialogStyle.color"

	>
		{{msg}}
	</modal>
	
</div>
	`,
	data:{
		oldpass: '',
		newpass: '',
		msg: '',
		error: false
	},
	computed:{
		dialogStyle(){
			let out = {
				background:"#d4edda",
				border:"#c3e6cb",
				color:"#155724"
			}
			if(this.error) {
				out.border="rgb(245, 198, 203)"
				out.background="rgb(248, 215, 218)"
				out.color="rgb(114, 28, 36)"
			} 

			return out

		}
	},
	methods:{
		renew(){
			axios.patch("/api/user/password",{
				oldpass: this.oldpass,
				newpass: this.newpass
			}).

			then(res=>{
				this.error = false
				if(res.status === 200) this.msg = 'password updated'
				else throw new Error("Wrong request")
			}).

			catch(err =>{
				this.error = true
				if(err.response !== undefined) this.msg = err.response.data
					
				else this.msg = "server error - reload page or repeat later"

			})
		}
	},
	components:{
		'modal':modal
	}
})