
function SQLI(input){};

function formatString(input){
'%s%p%x%d',
'.1024d',
'%.2049d',
'%p%p%p%p',
'%x%x%x%x',
'%d%d%d%d',
'%s%s%s%s',
'%99999999999s',
'%08x',
'%%20d',
'%%20n',
'%%20x',
'%%20s',
'%s%s%s%s%s%s%s%s%s%s',
'%p%p%p%p%p%p%p%p%p%p',
'%#0123456x%08x%x%s%p%d%n%o%u%c%h%l%q%j%z%Z%t%i%e%g%f%a%C%S%08x%%',
'%s x 129',
'%x x 257',




};

function bufferOverflow(input){
var bofString = (function(){var b=new function(){this.l=[255,256,257,420,511,512,1023,1024,2047,2048,4096,4097,5E3,1E4,2E4,3E4,32762,32763,32764,32765,32766,32767,32768,4E4,65534,65535,65536];this.m="A %x %n %s %s%n%x%d %99999999999s %99999999999d %99999999999x %99999999999n %08x %%20s %%20x %%20n %%20d".split(" ");this.s="%.1024d %.2048d %.4096d %.8200d %99999999999s %99999999999d %99999999999x %99999999999n %#0123456x%08x%x%s%p%n%d%o%u%c%h%l%q%j%z%Z%t%i%e%g%f%a%C%S%08x%%#0123456x%%x%%s%%p%%n%%d%%o%%u%%c%%h%%l%%q%%j%%z%%Z%%t%%i%%e%%g%%f%%a%%C%%S%%08x".split(" ");
this.f=this.s.length+this.m.length;this.g=function(a){return a<=this.m.length?Array(this.l[Math.floor(Math.random()*this.l.length)]).join(this.m[a]):this.s[a]};this.fz=function(){return this.g(Math.floor(Math.random()*this.f))}};return function(){return b.fz()}})();

return input + bofString();
};

function XSS(input){};

function OSCI(input){};

