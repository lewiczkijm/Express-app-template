var control = new Vue({
	el:"#rules",
	template:`

<div>
	<button @click="mode='list'; active=false ">Список пользователей</button>
	<button @click="mode='rules'" :disabled="!active">Настройки</button>
	<button @click="mode='raw'" :disabled="!active">Данные</button>
	
	<section v-if="mode == 'list'">
	<h2>Список пользователей</h2>
	<button @click="newUserWin=true">Новый</button>
		<article 
			v-for="(user, el) in users" 
			@click="select(el)"
		>

			<h3>{{user.name}}</h3>

			<span v-if="user.online">online</span>
			<span v-if="user.admin">Администратор</span>

		</article>
	</section>	
	
	

	<section v-else-if="mode == 'rules'">
	
	<h2>Параметры пользователя</h2>

	<p>{{selected.name}}</P>
	
	<p>Последний раз на сайте: {{selected.touch | date}} <span v-if="selected.online">online</span></P>
	
	<p>
		<label for="isAdmin">Администратор</label>
		<input id="isAdmin" type="checkbox" v-model="selected.admin">
	</P>
	
	<p><a href="" @click.prevent="saveChanges">Сохранить изменения</a></p>
	
	<p><a href="" @click.prevent="newPasswordWin = true">Сбросить пароль</a></p>
	
	<p><a href="" @click.prevent="delUser">Удалить</a></p>
	<!-- 
		Здесь будут дополнительные элементы, зависимые от логики приложения - 
		персональные данные, ссылки на публикации ... 
	-->
	</section>	
	


	<section v-else-if="mode == 'raw'">
	<h2>Редактирование данных</h2>
	<p>
		Здесь можно смотреть данные пользователя, корректировать, добавлять новые и удалять.
		Однако, не все параметры реально будут сохранены. Часть из них виртуальна и не предусматривает сохранения.
		Все введенные данные должны быть JSON валидными. Их тип определяется автоматически по контексту. 
		Это очень опасная функция. Неаккуратное изменение параметров может привести к 
		непредсказуемым последствиям. Не трогайте те данные, назначение которых вам не известно.
		Пользуйтесь этой вкладкой только если это вам действительно необходимо.
	</p>
		<form>
		<table>
		<thead>
		<tr>
			<th>Параметр</th>
			<th>Значение</th>
			<th>Тип</th>
		</tr>
		</thead>
		<tbody>
		<tr v-for="(element, i) in rawSelected">
			<td>{{element.name}}</td>
			<td><input type="text" v-model="element.value" size=70></td>
			<td>{{typeof element.value}}</td>
			<td>
				<button @click.prevent="delProperty(i)">-</button>
			</td>
		</tr>
		</tbody>
		</table>
		<input type="button" @click="addProperty" value="Добавить">
		<input type="reset">
		<input type="button" @click="saveRawChanges" value="Сохранить">
		</form>
	</section>
	<!-- ##Диалоговые окна -->




	<modal
		style="zIndex:100" 
		v-show="msg" 
		@close="msg = ''"
		title="Информационное сообщение"
	>
		{{msg}}
	</modal>	




	<modal 
		v-show="newUserWin"
		@close="newUserWin=false"
		title="Новый пользователь"
		ref="newUserWin"
	>
	<form>
	<p>
		<input type="text" v-model.lazy="newUser.login" id="userName">
		<label for="userName">Логин</label> 
	</P>
	<p>
		<input type="password" v-model.lazy="newUser.password" id="pass">
		<label for="pass">Пароль</label> 
	</P>
	<p>	
		<input type="checkbox" v-model.lazy="newUser.admin" id="isAdmin">
		<label for="isAdmin">Администратор</label> 
	</P>
	<p>	
		<input type="reset">
		<input type="button" @click="addUser" value="Создать">
	</P>
	</form>
	</modal>



	<modal 
		v-show="newPasswordWin" 
		@close="newPasswordWin=false"
		title="Сброс пароля"
	>
	<h4>Введите новый пароль</h4>
	<input type="password" v-model="newPassword">
	<input type="button" @click="resetPassword" value="принять">
	</modal>

</div>

	`,

	data:{
		mode:"list",
		users:users,
		active: false,

		selected:{},
		rawSelected:{},

		isNewUser: false,
		isNewProperty: false,

		msg: "",
		newUserWin:false,
		newUser:{
			login: "",
			password: "",
			admin: false
		},
		newPasswordWin:false,
		newPassword:""
		
	},
	methods:{
		select(el){
			this.active=el + 1; 
			this.mode='rules'; 
			this.selected = _.cloneDeep(this.users[this.active - 1])
			this.rawSelected = [] 
			for(let prop in this.users[this.active - 1]){
				if(!this.users[this.active - 1].hasOwnProperty(prop)) continue

				this.rawSelected.push({name:prop, value:this.users[this.active - 1][prop]})
			}
		},

		addUser(){
			axios.put("/users",
				{
					login:this.newUser.login,
					password:this.newUser.password,
					admin:this.newUser.admin
				}).
			then(userData=>{
				
				this.newUser.login = ""
				this.newUser.password =""
				this.newUser.admin = false

				this.users.push(userData.data)
				this.newUserWin = false;
			}).
			catch(this.httpErrorHandle)
		},

		delUser(){
			let path = `/users/${this.selected.name}`
			axios.delete(path).
			then(res=>{
				if(res.status === 200){
					this.msg=`Пользователь ${this.selected.name} успешно удален`
					this.users.splice(this.active - 1,1)
					this.mode = "list"
				}
				else throw new Error()
			}).
			catch(this.httpErrorHandle)
		},

		resetPassword(){
			let path = `/users/${this.selected.name}/password`
			axios.patch(path,{password:this.newPassword}).
			then(res =>{
				this.newPasswordWin = false
				this.newPassword = ""
				this.msg = "Пароль заменен"
			}).
			catch(this.httpErrorHandle)
		},

		saveChanges(){
			let path = `/users/${this.selected.name}`
			axios.patch(path,this.selected).
			then(res =>{
				this.msg=`Данные обновлены успешно`
				this.users[this.active - 1] = this.selected
			}).
			catch(this.httpErrorHandle)
		},

		addProperty(){
			let name = prompt("Введите название параметра")
			this.rawSelected.push({name:name,value:""})
		},
		delProperty(num){
			this.rawSelected.splice(num,1)
		},


		saveRawChanges(){
			let selected = {}
			for(let i = 0;i < this.rawSelected.length;i ++){
				try{
					selected[this.rawSelected[i].name] = JSON.parse(this.rawSelected[i].value)

				}catch(err){
					selected[this.rawSelected[i].name] = this.rawSelected[i].value
				}
			}

			this.selected = selected
			this.saveChanges()

		},

		httpErrorHandle(err){
			if(err.response.status === 400)
				this.msg=err.response.data
			else this.msg = "Ошибка сервера! Повторите попытку позже."

		}

	},
	filters:{
		date(value){
			if(!value) return "-"
			return new Date(Number(value)).toLocaleString()
		}
	},
	components:{
		modal:modal
	}
})