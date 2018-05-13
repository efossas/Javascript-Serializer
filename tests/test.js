var native = 'nativer';
var code = 'coder';
var et = {v:'my name is v'};
var _this = {
  aa: Boolean,
  ab: Date,
  ac: Map,
  ad: eval,
  bb: null,
  bc: undefined,
  bd: 123,
  be: "123",
  bf: 456.789,
  bg: "456.789",
  bh: 1e4,
  bi: "1e4",
  bj: 'some string',
  bk: false,
  bl: "false",
  bm: true,
  bn: "true",
  bo: /regexp/g,
  bp: Symbol("bla(bla)bla"),
  bq: new Promise((resolve) => resolve('hi')),
  br: Promise,
  bs: new Date(),
  bt: new Error('uh oh'),
  bu: function named() { return true; },
  bv: function() { return false; },
  bw: () => { return 0; },
  bx: "function ishmael() { return 'whale'; }",
  ia: [
    undefined,
    null,
    123,
    '123',
    'mystring',
    true,
    "true",
    "'true'",
    0,
    1e4,
    2.3e+5,
    NaN,
    "function ishmael() { return 'whale'; }",
    "'Infinity'",
    "Infinity",
    -Infinity,
    [ 'array', 'set', 'map', [1,2,3] ],
    { some: { day : Infinity, light : -Infinity } },
    function() { return 1; },
    { eval: (ink) => { return ink; } },
    eval
  ],
  ib: new Map([ 
    [ () => { return 'mapper'; }, Infinity ],
    [ 2, 'two' ],
    [ null,  [ 'array', undefined ]],
    [ true , { y: 'not' }]
  ]),
  ic: new Set([
    undefined,
    null,
    123,
    'mystring',
    0,
    [ 'array' ], 
    { some: { day : Infinity } },
    function() { return 1; },
    { eval:(ink) => { return ink; } },
    eval
  ]),
  id: new WeakMap([[ {}, 'one' ],[ {}, 'two' ]]),
  ie: new WeakSet([{},{}]),
  if: new ArrayBuffer(10),
  ig: new DataView(new ArrayBuffer(20)),
  doc: document,
  get: () => { return _this.v },
  ma: Math,
  mb: JSON,
  lo: new Proxy({}, { get: function(obj, prop) { return obj[prop]; } }),
  nest: 
  {
    one: 
    {
      two:
      {
        three:eval
      }
    }
  },
  ff: function blow() { return '[native code]'; },
  fg: function what() { [native,code] },
  fo:
  {
    fa: () => { console.log('nested anonymous function'); },
    fb: function named() { console.log('nested named function'); },
    fc: () => { console.log(native); },
    fd: function named() { console.log(code); },
    fe: eval
  },
  print: (v) => { console.log(v); },
  ret: () => { return et.v },
  set: (v) => { _this.v = v },
  va: native,
  vb: code,
  vc: et,
  za: Infinity,
  zb: "Infinity",
  zc: -Infinity,
  zd: "-Infinity",
  ze: NaN,
  zf: "NaN",
  zz: (a) => { return [global,local,a]; }
};

console.log(_this);
var cereal = serialize(_this);
var copy = unserialize(cereal);
console.log(copy);

