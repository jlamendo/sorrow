

    var otuMapArray = function(data){
    var _this = this;
    var data=data;
    var map = map;
    var len = data.length;
   console.log(Object.keys(data))
   _this.rb = require('crypto').randomBytes;
    var map=[];
        for (var i = 0; i < len; i++) {
           map.push(i)
        }
            //console.log(map)    
    _this.reset = function(){
    if(!map) {
            map=[];
        }
        for (var i = 0; i < len; i++) {
                map.push(i)
    }

    }

   _this.pop = function(){
        var index =_this.rand();
        if (map[index] > -1 && map[index] <= ( len -1)) {
            return data[map.splice(index, 1)];
        }
    }
  /* _this.extend = function(arr){
         var _this = this;
        if(typeof arr == 'function'){
            arr = arr();
        } 
        if(typeof arr !== 'array' && typeof arr === 'string' ){
            arr = [arr];
        } else if(typeof arr !== 'array'){
            return new Error('Invalid extension')
        }
        data =data.concat(data, arr)
        map=[];
            for (var i = 0; i < len; i++) {
               map[i]=i
            }
        return_this;
    }
*/
   _this.rand = function(){
        var maplen = map.length;
        var byteRange = Math.max(Math.min(Math.ceil(Math.log(maplen) / Math.log(256)), 150), 1);
        var bytes =_this.rb(byteRange);
        var num = 0
        for (var i = 0; i < bytes.length; i++) {
            num += parseInt(bytes[i], 16)
            }
            num = '0.' + num.toString();
            num = Number(num);
            num = Math.floor(num * maplen);
            return num
    }

    }


    module.exports=otuMapArray;