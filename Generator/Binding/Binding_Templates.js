BindingStatementHeader = [
]


BindingStatementBody = [
    {
        w: 2,
        v: function (dr) {
          var k = rand(4);
          if (k == 0) return 'fthis.resetForm();';
          if (k == 1) return cat(['fthis.pageNum =', rand(2), ';']);
          if (k == 2) return cat(['fthis.zoom=', rand(0x1000), ';']);
          if (k == 3) return cat(['fthis.scroll(', rand(0x1000), ');']);
        },
      },
]

