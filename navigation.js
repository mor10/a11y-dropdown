/**
 * File navigation.js.
 *
 * Handles toggling the navigation menu for small screens and enables TAB key
 * navigation support for dropdown menus.
 */
let menuToggle = document.querySelector( '.menu-toggle' );
let siteNavigation = document.querySelector( '#primary-menu ul' );
let subNavigation = siteNavigation.querySelectorAll( '.page_item_has_children, .menu-item-has-children' );
let screenReaderText = new Object();
screenReaderText.expand = 'Expand navigation list';
screenReaderText.collapse = 'Collapse navigation list';

/**
 * Polyfill for feature detection of passive property.
 * @link: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */
let supportsPassive = false;
let opts;

try {
	opts = Object.defineProperty({}, 'passive', {
		get: function() {
			supportsPassive = true;
		}
	});
	window.addEventListener( 'testPassive', null, opts );
	window.removeEventListener( 'testPassive', null, opts );
} catch ( e ) {}

/**
 * Add aria-describedby to current menu item if any.
 */
function currentPage() {
	let currentPage = siteNavigation.querySelector( '.current_page_item, .current_menu_item' );
	currentPage.firstElementChild.setAttribute( 'aria-describedby', 'current' );
}
currentPage();

/**
 * Main navigation handler.
 */

function navSetup() {

	// Return early if menuToggle is missing.
	if ( null === menuToggle ) {
		return;
	}

	// Add an initial values for the attribute.
	menuToggle.classList.remove( 'hidden' );

	// Hide siteNavigation using CSS.
	siteNavigation.classList.add( 'hidden' );

	// Toggle siteNavigation visibility.
	function navToggle() {
		siteNavigation.classList.toggle( 'hidden' );
	}

	menuToggle.addEventListener( 'click', navToggle, false );

	/**
	 * Find drop-downs, add a toggle button to them.
	 */
	function createButton( li ) {
		let buttonText, parent, newButton;

		buttonText = document.createTextNode( screenReaderText.expand );

		newButton = document.createElement( 'button' );
		newButton.classList.add( 'dropdown-toggle' );
		newButton.setAttribute( 'aria-expanded', 'false' );
		newButton.appendChild( buttonText );

		li.insertBefore( newButton, li.querySelector( 'ul' ) );
	}

	for ( let i = 0; i < subNavigation.length; ++i ) {
		createButton( subNavigation[i]);
	}

};

navSetup();

/**
 * Toggle visibility of sub-menu.
 *
 * @param {Object} subNav Current sub-menu.
 * @param {bool} mouse Mouse hovering over sub-menu.
 */
function dropDown( subNav, mouse ) {

	// Toggle the .toggled class to hide/reveal sub-menu.
	let childNav = subNav.querySelector( 'ul' );
	childNav.classList.toggle( 'toggled' );

	// Change the aria-expanded and button text to match current button behavior.
	let toggleButton = subNav.querySelector( '.dropdown-toggle' );
	'false' === toggleButton.getAttribute( 'aria-expanded' ) ? toggleButton.setAttribute( 'aria-expanded', 'true' ) : toggleButton.setAttribute( 'aria-expanded', 'false' );
	toggleButton.textContent = ( toggleButton.textContent === screenReaderText.expand ? screenReaderText.collapse : screenReaderText.expand );

	// If mouse is within sub menu bounds, disable button.
	toggleButton.disabled = mouse;
}

/**
 * Monitor focus when keyboard nav has opened sub-menu
 *
 * @param {Object} subNav
 */
function collapseMonitor( subNav ) {

	// Get only the direct children of the current sub-menu.
	let subNavChildren = subNav.querySelector( 'ul' ).children;

	// Get the link inside the last item in the current sub-menu.
	let lastLink = subNavChildren[ subNavChildren.length - 1 ].querySelector( 'a' );

	for ( let i = 0; i < subNavChildren.length; ++i ) {
		subNavChildren[i].querySelector( 'a' ).addEventListener( 'blur', function() {
			// Get the previous sibling of the parent.
			let mySibling = subNavChildren[i].previousSibling;
			console.log(mySibling);
		}, false );
	}


	// Listen for the blur event on the last link and collapse the sub-menu.
	lastLink.addEventListener( 'blur', function() {
		dropDown( subNav, false );
		console.info('collapse');
	}, false );

}

/**
 * Listen for mouse, touch, and keyboard interaction with sub-menu.
 */
for ( let i = 0; i < subNavigation.length; ++i ) {

	// On mouse enter, expand sub-menu.
	subNavigation[i].addEventListener( 'mouseenter', function() {
		dropDown( subNavigation[i], true );
	},  false );

	// On mouse leave, collapse sub-menu.
	subNavigation[i].addEventListener( 'mouseleave', function() {
		dropDown( subNavigation[i], false );
	},  false );

	// On keyboard activation of button, toggle sub-menu.
	let toggleButton = subNavigation[i].querySelector( '.dropdown-toggle' );
	toggleButton.addEventListener( 'click', function() {
		dropDown( subNavigation[i], false );
	},  false );

	// On keyboard navigation to and within sub-menu.
	let parentLink = subNavigation[i].querySelector( 'a' );
	parentLink.addEventListener( 'focus', function() {

		// Expand sub-menu on focus.
		dropDown( subNavigation[i], false );

		// Monitor for when user tabs out of the sub-menu.
		collapseMonitor( subNavigation[i]);
	}, false );

}

