'use strict';

//convert entire menu to an array using recursion
function convertToArray(menu, name) {
  const listUL=[];
  var temp=[];
  let NodeInfo = {ulID:name.substring(name.indexOf("#") + 1), controlledNodes: [], openIndex: null, useArrowKeys: true, levelNodes:[] };
  listUL.push(menu, NodeInfo);  
  const tempULList = [];
  const liElements = [
        ...menu.querySelectorAll(
          name + ' > li'
        ),
      ];  
  liElements.forEach((node) => {
    const Ul = node.querySelector('ul'); 
    if (Ul) {      
      const ulId = '#'+Ul.id;
      temp = ([convertToArray2(Ul, ulId)]); 
      tempULList.push(temp);
    }    
  });  
  listUL.push(tempULList); 
  return listUL;
}

//second recursion function to convert to array
function convertToArray2(menu, name) {
  const listUL=[];
  var temp=[];
  let NodeInfo = {ulID:name.substring(name.indexOf("#") + 1), controlledNodes: [], openIndex: null, useArrowKeys: true, levelNodes:[] };
  listUL.push(menu, NodeInfo);  
  const liElements = [
        ...menu.querySelectorAll(
          name + ' > li'
        ),
      ];
  liElements.forEach((node) => {
    const Ul = node.querySelector('ul');    
    if (Ul) {
      const ulId = '#'+Ul.id;      
     temp.push(convertToArray2(Ul, ulId));
    }    
  });
  if(temp.length>0){
    listUL.push(temp);
  }  
  return listUL;
}

//main class
class DisclosureNav {
  constructor(domNode) {
    this.rootNode = domNode;
    this.getVariableResult = null;
    this.mainMenuID = '#nlevels-top-menu';
    this.mainMenuID2 = 'nlevels-top-menu';
    this.menuArray = convertToArray(this.rootNode, this.mainMenuID);
    this.lastOpenedButton = null;
    this.lastOpenedSubButton = null;
    this.traverseArray(this.menuArray);   
  }  
  
  //perform functions, namely addListeners, to each menu node using recusion
  traverseArray(arr) {
    arr.forEach((element, index) => {
      if (Array.isArray(element)) {
        this.traverseArray(element);
      } else if (typeof element === 'object' && element !== null) {
        if (index==0) {
          const ulId = element.id;
          this.addListeners(this.getVariables(arr, ulId), element);
        } 
      }
    });
  }
  
  //retrieve variable values of menu nodes
  getVariables(arr, id){
    arr.forEach((element, index) => {
      if (Array.isArray(element)) {
        this.getVariables(element, id);
      } else if (typeof element === 'object' && element !== null) {
        if (index==1) {
          if(element.ulID == id){            
             this.getVariableResult =  element;
          }
        }
      }
    });
    return this.getVariableResult;
  }
  
  //add listener methods to each menu node
  addListeners(variables, ul){
    const liElements = [
        ...ul.querySelectorAll(
          '#'+variables.ulID+ ' > li'
        ),
      ];

    var levelNodes =[];
    liElements.forEach((node) => {

      const Button = node.querySelector('button');
      const Link = node.querySelector('a'); 

      if (Link){
        levelNodes.push(Link);
      }    
      if (Button){
        levelNodes.push(Button);
      }
      
    });
    variables.levelNodes = levelNodes;
    
    levelNodes.forEach((node) => {
      if (
        node.tagName.toLowerCase() === 'button' &&
        node.hasAttribute('aria-controls')
      ) {
        const menu = node.parentNode.querySelector('ul');

        if (menu) {
          variables.controlledNodes.push(menu);
          node.setAttribute('aria-expanded', 'false');
          this.toggleMenu(menu, false);            
          menu.addEventListener('keydown', this.onMenuKeyDown.bind(this));                 
          node.addEventListener('click', this.onButtonClick.bind(this));
          node.addEventListener('keydown', this.onButtonKeyDown.bind(this));
        }
      }
      else {
        variables.controlledNodes.push(null);          
        node.addEventListener('keydown', this.onLinkKeyDown.bind(this));
      }
    });
    ul.addEventListener('focusout', this.onBlur.bind(this));
  }

  controlFocusByKey(keyboardEvent, nodeList, currentIndex) {
    switch (keyboardEvent.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        keyboardEvent.preventDefault();
        if (currentIndex-1 > -1) {
          var prevIndex = Math.max(0, currentIndex - 1);
          nodeList[prevIndex].focus();
        } else {
          if(nodeList[0].parentNode.parentNode.id !==this.mainMenuID2){
            nodeList[0].parentNode.parentNode.parentNode.querySelector('button').focus();
            var ulInfo = this.getVariables(this.menuArray, nodeList[0].parentNode.id);
            this.toggleExpand(ulInfo.openIndex, false, ulInfo);
          }          
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        keyboardEvent.preventDefault();
        if (currentIndex > -1) {
          var nextIndex = Math.min(nodeList.length - 1, currentIndex + 1);
          nodeList[nextIndex].focus();
        }
        break;
      case 'Home':
        keyboardEvent.preventDefault();
        nodeList[0].focus();
        break;
      case 'End':
        keyboardEvent.preventDefault();
        nodeList[nodeList.length - 1].focus();
        break;
    }
  }
    
  onBlur(event) {
    var ulInfo = this.getVariables(this.menuArray, event.target.parentNode.parentNode.id);
    var elementById = document.getElementById(event.target.parentNode.parentNode.id);

    this.recursiveClose(elementById, ulInfo);
  }
    
  //recursive function called to close whether on click outside of menu or escape key pressed
  recursiveClose(elementById, ulInfo) {
    
    var menuContainsFocus = elementById.contains(event.relatedTarget);
    if (!menuContainsFocus) {      
      this.toggleExpand(ulInfo.openIndex, false, ulInfo);
      var idHolder = elementById.id;
      ulInfo = this.getVariables(this.menuArray, elementById.parentNode.parentNode.id);
      elementById = document.getElementById(elementById.parentNode.parentNode.id);
      if (idHolder !== this.mainMenuID2) {
        this.recursiveClose(elementById, ulInfo);
      }
    }
  }
  
  closeSubmenu( ulInfo) {
    this.toggleExpand(ulInfo.openIndex, false, ulInfo);
    this.lastOpenedSubButton.focus();
    this.lastOpenedSubButton = (this.lastOpenedSubButton.parentNode.parentNode.parentNode.querySelector('button'));
    //this.lastOpenedSubButton = null;
  }

  onButtonClick(event) {   
    var ulInfo = this.getVariables(this.menuArray, event.target.parentNode.parentNode.id)
    var button = event.target;
    if (button.parentNode.parentNode.id === this.mainMenuID2){
      this.lastOpenedButton = button;
    } 
    this.lastOpenedSubButton = button;
    var buttonIndex = (ulInfo.levelNodes).indexOf(button);
    var buttonExpanded = button.getAttribute('aria-expanded') === 'true';
    this.toggleExpand(buttonIndex, !buttonExpanded, ulInfo);
  }

  onButtonKeyDown(event) {
    var ulInfo = this.getVariables(this.menuArray, event.target.parentNode.parentNode.id);
    var ulInfo2 = this.getVariables(this.menuArray, event.target.parentNode.parentNode.parentNode.parentNode.id);
    var targetButtonIndex = ulInfo.levelNodes.indexOf(document.activeElement);
    // close on escape
    if (event.key === 'Escape') {
      this.closeSubmenu(ulInfo2);
    }
        
    // handle arrow key navigation between top-level buttons, if set
    else if (ulInfo.useArrowKeys) {
      this.controlFocusByKey(event, ulInfo.levelNodes, targetButtonIndex);
    }
  }
  
  onLinkKeyDown(event) {
    
    var ulInfo = this.getVariables(this.menuArray, event.target.parentNode.parentNode.id);
    var ulInfo2 = this.getVariables(this.menuArray, event.target.parentNode.parentNode.parentNode.parentNode.id);
    var targetLinkIndex = ulInfo.levelNodes.indexOf(document.activeElement);
    // handle arrow key navigation between top-level buttons, if set
    if (ulInfo.useArrowKeys) {      
      this.controlFocusByKey(event, ulInfo.levelNodes, targetLinkIndex);
    }
    if (event.key === 'Escape') {
      this.closeSubmenu(ulInfo2);
    }
  }

  onMenuKeyDown(event) {
    var ulInfo = this.getVariables(this.menuArray, event.target.parentNode.parentNode.id);
    
    if (ulInfo.openIndex === null) {
      return;
    }

    var menuLinks = Array.prototype.slice.call(
      ulInfo.controlledNodes[ulInfo.openIndex].querySelectorAll('a')
    );
    var currentIndex = menuLinks.indexOf(document.activeElement);

    // close on escape
    if (event.key === 'Escape') {
      //(ulInfo.levelNodes)[ulInfo.openIndex].focus();
      this.toggleExpand(ulInfo.openIndex, false, ulInfo);
    }

    // handle arrow key navigation within menu links, if set
    else if (ulInfo.useArrowKeys) {
      this.controlFocusByKey(event, menuLinks, currentIndex);
    }
  }

  toggleExpand(index, expanded, ulInfo) {
    // close open menu, if applicable
    if (ulInfo.openIndex !== index) {      
      this.toggleExpand(ulInfo.openIndex, false, ulInfo);
    }

    // handle menu at called index
    if ((ulInfo.levelNodes)[index]) {      
      ulInfo.openIndex = expanded ? index : null;
      (ulInfo.levelNodes)[index].setAttribute('aria-expanded', expanded);
      
      this.toggleMenu(ulInfo.controlledNodes[index], expanded);
      if (expanded) {
        const subMenu = ulInfo.controlledNodes[index];
        const focusableElement = subMenu.querySelectorAll('a');
        if (focusableElement.length > 0) {
          focusableElement[0].focus();
        }
      }
    }
  }

  toggleMenu(domNode, show) {
    if (domNode) {
      domNode.style.display = show ? 'block' : 'none';
    }
  }

  updateKeyControls(useArrowKeys) {
    this.useArrowKeys = useArrowKeys;
  }
   
}

/* Initialize Disclosure Menus */

window.addEventListener(
  'load',
  function () {
    var menus = document.querySelectorAll('.disclosure-nav');
    var disclosureMenus = [];

    for (var i = 0; i < menus.length; i++) {
      disclosureMenus[i] = new DisclosureNav(menus[i]);
    }

    // listen to arrow key checkbox
    var arrowKeySwitch = document.getElementById('arrow-behavior-switch');
    if (arrowKeySwitch) {
      
      arrowKeySwitch.addEventListener('change', function () {
        var checked = arrowKeySwitch.checked;
        for (var i = 0; i < disclosureMenus.length; i++) {
          disclosureMenus[i].updateKeyControls(checked);          
        }
      });
    }

    // fake link behavior
    disclosureMenus.forEach((disclosureNav, i) => {
      var links = menus[i].querySelectorAll('[href="#mythical-page-content"]');
      var examplePageHeading = document.getElementById('mythical-page-heading');
      for (var k = 0; k < links.length; k++) {
        // The codepen export script updates the internal link href with a full URL
        // we're just manually fixing that behavior here
        links[k].href = '#mythical-page-content';

        links[k].addEventListener('click', (event) => {
          // change the heading text to fake a page change
          var pageTitle = event.target.innerText;
          examplePageHeading.innerText = pageTitle;

          // handle aria-current
          for (var n = 0; n < links.length; n++) {
            links[n].removeAttribute('aria-current');
          }
          event.target.setAttribute('aria-current', 'page');
        });
      }
    });
  },
  false
);