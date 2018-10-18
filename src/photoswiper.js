/* --------------------------------------------------------------------------
 * Photoswiper (v2.0.7): photoswiper.js
 * by Evan Yamanishi
 * Licensed under GPL-3.0
 * -------------------------------------------------------------------------- */

import PhotoSwipe from 'photoswipe';
import tabtrap from 'tabtrap';
import PhotoSwipeUIDefault from 'photoswipe/dist/photoswipe-ui-default';
import merge from 'lodash.merge';
import * as util from './util';

/* CONSTANTS */

const NAME = 'photoswiper';
const VERSION = '2.0.7';
const DATA_KEY = 'photoswiper';

const Default = {
	onInit: () => {},
	onOpen: () => {},
	photoswipeUI: PhotoSwipeUIDefault,
	selectors: {
		PSWP: '.pswp',
		GALLERY: 'figure',
		TITLE: 'figcaption',
		FIGURE: 'figure',
		LINK: 'a',
		THUMB: 'img',
		CAPTION: 'figcaption',
	},
};

/* CLASS DEFINITION */
export default class Photoswiper {
	constructor(galleryElement, config) {
		this.galleryElement = galleryElement;
		if (config.structure && !config.selectors) {
			process.emitWarning(
				'The "structure" option has been renamed "selectors".\n'
				+ '"structure" will be removed in a future update.',
				'DeprecationWarning',
			);
			config.selectors = config.structure;	// eslint-disable-line
		}
		this.config = merge({}, Photoswiper.Default, config);

		if (util.isValidPswp(this.galleryElement)) {
			// bind handlers
			this.onClick = this.clickHandler.bind(this);

			// create the selectors
			const bemSelectors = (this.config.bemRoot) ? util.bemSelectors(this.config.bemRoot) : {};
			this.selectors = merge({}, this.config.selectors, bemSelectors);

			// collect figures and items
			this.figures = this.galleryElement.querySelectorAll(this.selectors.FIGURE)
				|| this.galleryElement;
			this.items = Array.from(this.figures).map(fig => this.parseFigure(fig));

			// add listeners to open on click
			this.figures.forEach((figure) => {
				figure.querySelector(this.selectors.LINK)
					.addEventListener('click', this.onClick);
			});

			this.enabled = true;

			if (typeof this.config.onInit === 'function') {
				this.config.onInit.call(this, this.figures);
			}
		} else {
			throw new Error('Gallery elements must contain a linked image (a[href]>img[src]).\n', this.galleryElement);
		}
	}


	// getters

	static get NAME() {
		return NAME;
	}

	static get VERSION() {
		return VERSION;
	}

	static get DATA_KEY() {
		return DATA_KEY;
	}

	static get Default() {
		return Default;
	}

	static get pid() {
		const pid = util.getUrlParam('pid');
		return (pid) ? parseInt(pid, 10) : undefined;
	}

	static get gid() {
		const gid = util.getUrlParam('gid');
		return (gid) ? parseInt(gid, 10) : undefined;
	}


	// public

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}

	toggle() {
		this.enabled = !this.enabled;
	}



	_getConfig(config) {
		return Object.assign({},
			Default,
			config);
	}

			}





		}
	}

	_openPhotoSwipe(index, galleryEl, fromURL, triggerEl) {
		if (!isValidPswp(galleryEl)) return;
		const pswpEl = document.querySelector(this.structure.PSWP);
		if (!pswpEl) {
			throw new Error('Make sure to include the .pswp element on your page');
		}

		this.items = this._getItems(galleryEl);
		this.options = this._getOptions(galleryEl);

		this.options.index = parseInt(index, 10);

		if (fromURL) {
			this.options.showAnimationDuration = 0;
			this.options.index = this._urlIndex(index);
		}

		if (isNaN(this.options.index)) return;

		const pswp = new PhotoSwipe(pswpEl, this.config.photoswipeUI, this.items, this.options);
		if (this.enabled) pswp.init();

		this._manageFocus(pswp, triggerEl, pswpEl);

		if (typeof this.config.onInit === 'function') {
			this.config.onInit.call(pswp, pswp);
		}
	initListeners() {
		this.figures.forEach((figure) => {
			figure.querySelector(this.selectors.LINK)
				.addEventListener('click', this.onClick);
		});
	}

	clickHandler(e = window.event) {
		e.preventDefault();
		const clickTarget = e.target || e.srcElement;
		const clickFigure = clickTarget.closest(this.selectors.FIGURE)
			|| this.galleryElement;
		const index = Array.from(this.figures).indexOf(clickFigure);
		this.open(index, clickTarget);
	}

	parseFigure(figure) {
		// required galleryElements
		const link = figure.querySelector(this.selectors.LINK);
		const thumb = figure.querySelector(this.selectors.THUMB);

		// optional caption
		const cap = figure.querySelector(this.selectors.CAPTION);
		const size = link.getAttribute('data-size').split('x');

		const item = {
			el: figure,
			h: parseInt(size[1], 10),
			w: parseInt(size[0], 10),
			src: link.getAttribute('href') || link.getAttribute('data-href'),
		};

		if (thumb) {
			item.alt = thumb.getAttribute('alt');
			item.msrc = thumb.getAttribute('src');
		}

		if (cap && cap.innerHTML.length > 0) {
			item.title = cap.innerHTML;
		}
		return item;
	}
	// static

	static initAll(selector, config) {
		const args = parseArgs(selector, config);
		return Array.from(args.elements)
		// filter out invalid elements
			.filter(el => isValidPswp(el),
				// initialize the remaining
			).map((el, i) => {
				el.setAttribute('data-pswp-uid', i + 1);
				return new Photoswiper(el, args.config);
			});
	}

	// borrowed from Bootstrap 4 pattern
	static _jQueryInterface(config) {
		let index = 0;
		return this.each(function () {
			if (isValidPswp(this)) {
				index++;
				let data = jQuery(this).data(DATA_KEY);
				const _config = typeof config === 'object'
					? config : {};
				_config.el = this;

				if (!data && /dispose|hide/.test(config)) {
					return;
				}

				if (!data) {
					this.setAttribute('data-pswp-uid', index);
					data = new Photoswiper(this, _config);
					jQuery(this).data(DATA_KEY, data);
				}

				if (typeof config === 'string') {
					if (data[config] === undefined) {
						throw new Error('No method named "jQuery{config}"');
					}
					data[config]();
				}
			}
		});
	}

	static isValidPswp(element) {
		return isValidPswp(element);
	}
}


/* JQUERY INTERFACE INITIALIZATION */

if (window.jQuery !== undefined) {
	const JQUERY_NO_CONFLICT = jQuery.fn[NAME];
	jQuery.fn[NAME] = Photoswiper._jQueryInterface;
	jQuery.fn[NAME].Constructor = Photoswiper;
	jQuery.fn[NAME].noConflict = function () {
		jQuery.fn[NAME] = JQUERY_NO_CONFLICT;
		return Photoswiper._jQueryInterface;
	};
}

export default Photoswiper;
