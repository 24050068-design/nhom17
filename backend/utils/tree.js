exports.buildTree = (comments) => {
    const map = {};
    const roots = [];
  
    comments.forEach(c => {
      c.children = [];
      map[c.id] = c;
    });
  
    comments.forEach(c => {
      if (c.parentId) {
        map[c.parentId]?.children.push(c);
      } else {
        roots.push(c);
      }
    });
  
    return roots;
  };