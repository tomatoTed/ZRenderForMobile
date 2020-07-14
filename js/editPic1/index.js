let zr;//画板对象
let colorList=["#dcea26","#d25c97"];//颜色数组
let colorIndex=0;
let slognText;//宣言图形对象
let nickNameText;//昵称图形对象
let bgImage;//添加进来的照片
let rotating=false;//正在旋转，用于防抖
let lastRadian;//上一次图片旋转的弧度
$(function(){
    $('.file').change(function () {
        zr= zrender.init(document.querySelector('#picBox'),{
            width:$(".upload-wrap").width(),
            height:$(".upload-wrap").height(),
        });
        console.log('画布的宽高是',zr.getWidth(),zr.getHeight());
        $('.upload-wrap').hide();
        $('.loading-bar').show();
        $('.remove-pic').show();
        $('#picBox').show()
        addBgImage(this.files[0]);
        $('.file').val('');
        $('.loading-bar').hide();
        addHeader();
        addFooter();
        addNickName('请问如何把我的名字弄长啊',colorList[colorIndex]);
        addCityAndTime('乌鲁木齐');
    });
    //清除画板滑动时间
    $("#picBox").on("touchstart",function(e){
        //console.log("点击画板",e);
        e.preventDefault(); //阻止触摸时页面的滚动，缩放
    })
    //切换颜色
    $(".edit-btn").find("span").on("click",function(){
        let index=$(this).data("index");
        colorIndex=index-0;
        slognText.attr({
            style:{
                textFill: colorList[colorIndex],
            }
        });
        nickNameText.attr({
            style:{
                textFill: colorList[colorIndex],
            }
        });
    });
    //清除画板
    $(".remove-pic").on("click",function(){
        zr.clear();
        $('.remove-pic').hide();
        $('.upload-wrap').show();
    });
    //宣言弹窗
    $("#inputWord").on("click",function(){
        $('.mytext-modal').show();
        $('#myEntry').focus();
    });
    //宣言确认
    $(".mytext-text-btn").on("click",function(){
        addSlogn($('#myEntry').val(),colorList[colorIndex]);
        $('.mytext-modal').hide();
    })
 
});


 //添加背景图
 function addBgImage(file) {
    let img = new Image();
    let url=getUrl(file);
    bgImage= new zrender.Image({  
        draggable: true,
        style:{
            x:0,
            y:0,
            z:0,
            width:zr.getWidth(),
            height:zr.getHeight(),
            image:url
        }
    }).on('pinch', function (e) {
        onPinch(e);
    })

    zr.add(bgImage);
    img.onload = function () {
        let ratio=this.height/this.width;
        let width=zr.getWidth();
        let height=width*ratio;
        bgImage.attr({
            style:{
                height:height
            }
        });
        console.log("底图的宽高",this.width , this.height);
    };
    img.src = url;

}

//拖动事件，双指操作
function onPinch(e){
    if(e.event.touches.length<2){//单指
        return;
    }

    //缩放,自己通过计算实现，api实现的太卡了
    if(e.event.pinchScale&&e.event.pinchScale!==1){
        let new_width=e.target.style.width*e.event.pinchScale;
        let new_height=e.target.style.height*e.event.pinchScale;
        bgImage.attr({
            style:{
                x:e.target.style.x+(e.target.style.width-new_width)/2,
                y:e.target.style.y+(e.target.style.height-new_height)/2,
                height:new_height,
                width:new_width
            }
        });
    }

    //旋转
    if(!rotating){
        rotating=true;
        //当前夹角
        let currentRadian=getRadian(e.event.touches[0],e.event.touches[1]);
        if(e.event.changedTouches.length==1&&e.event.touches.length==2){//每轮双指第一次同时触摸
            lastRadian=currentRadian
        }
    
        //和上一次夹角差值
        let changedRadian = currentRadian-lastRadian;
        console.log( bgImage.rotation,"当前的弧度",currentRadian,"上一次弧度",lastRadian,"变化的弧度",changedRadian);
        lastRadian=currentRadian;
        if(changedRadian!=0){
            setTimeout(setRotate,20,
                bgImage.rotation-1.5*changedRadian,//系数是旋转灵敏度，默认是1个弧度
                bgImage.style.x+bgImage.style.width/2,
                bgImage.style.y+bgImage.style.height/2
                );
        }else{
            rotating=false;
        }
    }
 }
//计算任意两个点和坐标轴夹角的弧度
function getRadian(p1,p2){
    return Math.atan2(p2.clientY-p1.clientY, p2.clientX-p1.clientX);
}

//设置旋转
function setRotate(newRadian,x,y){
    //设置缩放或者旋转的中心
    bgImage.attr('origin',[x,y]);
    bgImage.attr('rotation',[newRadian]);
    rotating=false;
}
 //添加左上角图片
function addHeader() {
    //465*256
    let ratio=256/465;// height/width
    let width=zr.getWidth()*0.74;
    let height=width*ratio;
    let photo= new zrender.Image({  
        // draggable: true,
        style:{
            x:0,
            y:0,
            width:width,
            height:height,
            image:'image/editPic/header.png'
        }
    });
    zr.add(photo);
    console.log(photo)
}

 //添加左上角图片
function addFooter() {
     //665*376
    let ratio=375/665;// height/width
    let width=zr.getWidth();
    let height=width*ratio;
    let photo= new zrender.Image({  
        // draggable: true,
        style:{
            x:0,
            y:zr.getHeight()-height,
            width:width,
            height:height,
            image:'image/editPic/footer.png'
        }
    });
    zr.add(photo);
}
 //添加昵称
 function addNickName(nickName,color) {
          //665*376
    let ratio=375/665;// height/width
    let width=zr.getWidth();
    let height=width*ratio;
    nickName=nickName||"";
    nickNameText = new zrender.Text({
        style: {
            text: '@'+nickName,
            textAlign: 'left',
            textVerticalAlign: 'middle',
            fontSize: 14,
            fontFamily: 'fzsk',
            textFill: color||'#fff',
        },
        position: [28,zr.getHeight()-height+75]
    });
    nickNameText.attr({
        rotation:0.3
    });
    zr.add(nickNameText);
}
 //添加城市和时间
 function addCityAndTime(cityName,time) {
    //665*376
    var ratio=375/665;// height/width
    var width=zr.getWidth();
    var height=width*ratio;
    cityName=cityName||"中国";
    time=time||new Date();
    
    var text = new zrender.Text({
        style: {
            text: ('你好·'+cityName)+"\n"+(time.getHours()>11?"PM":"AM")+time.format("hh:mm"),
            textAlign: 'left',
            textVerticalAlign: 'middle',
            fontSize: 12,
            fontFamily: 'Arial',
            textFill: '#fff',
        },
        position: [32,zr.getHeight()-height+100]
    });
    text.attr({
        rotation:0.3
    });
    zr.add(text);
}
 //添加昵称
 function addSlogn(slogn,color) {
    //665*376
    var ratio=375/665;// height/width
    var width=zr.getWidth();
    var height=width*ratio;
    slogn=slogn||"";
    if(slogn.length>13){
        slogn=slogn.substr(0,13)+"\n"+slogn.substr(13,slogn.length);
    }
    slognText = new zrender.Text({
        draggable: true,
        style: {
            text: slogn||"",
            textAlign: 'left',
            textVerticalAlign: 'middle',
            fontSize: 20,
            fontStyle:'italic',
            fontFamily: 'fzsk',
            textFill: color||'#fff',
        },
        position: [38,zr.getHeight()-height+130]
    });
    slognText.attr({
        rotation:0.3
    });
    zr.add(slognText);
} 
//文件转url
function getUrl(file) {
    var url = null;
    if (window.createObjectURL !== undefined) {
      url = window.createObjectURL(file);
    } else if (window.URL !== undefined) {
      url = window.URL.createObjectURL(file);
    } else if (window.webkitURL !== undefined) {
      url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

Date.prototype.format = function(fmt){
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}
