var modal = {
	name:'modal',
	template:`

<div :style="out" @click.prevent="close"><div @click.stop="" :style="win">
	
	<div :style="header">{{title}}<a :style="btn" href="" @click.prevent="close">X</a></div>
	<div :style="msgBox"><slot></slot></div>

</div></div>

	`,
	props:['title',"background","color","border"],
	data:
		function(){ return {

		out:{
			position:"absolute",
			top:0,
			left:0,
			width:"100%",
			height:"100%",
			background:"rgba(0,0,0,0.5)",
		},
		win:{
			margin:"auto",
			marginTop:"25%",
			borderRadius:"1em",
			border:"solid 1px #ccc",
			width:"30%",
			padding:"1em",
			background:"#FFF",
			fontSize:"1.2em",
		},
		header:{
			marginBottom:"0.5em",
			borderBottom:"solid 1px",
			paddingBottom:"0.5em",
			paddingRight:"0.5em"
		},
		btn:{
			float:"right",
			textDecoration:"none",
			color:"#000"
		},
		msgBox:{},

	}},
	methods:{
		close(){
			this.$emit('close')
		}
	},
	computed:{
		msgBackground(){
			var out = "#fff"
			if(this.background) out = this.background
			return out 
		},
		msgColor(){
			var out = "#000"
			if(this.color) out = this.color
			return out 
		},
		msgBorder(){
			var out = "#CCC"
			if(this.color) out = this.border
			return out 
		}
	},
	created(){
		if(this.background)
			this.win.background = this.background
		if(this.color)
			this.win.color = this.color
		
		if(this.border){
			this.win.borderColor = this.border
			this.header.borderColor = this.border
		}
	},
	watch:{
		msgBackground(newValue){
			this.win.background = newValue
		},
		msgColor(newValue){
			this.win.color = newValue
		},
		msgBorder(newValue){
			this.win.borderColor = newValue
			this.header.borderColor = newValue
		}	
	}

}