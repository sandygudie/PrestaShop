require('module-alias/register');
const BOBasePage = require('@pages/BO/BObasePage');

module.exports = class AddSupplier extends BOBasePage {
  constructor(page) {
    super(page);

    this.pageTitle = 'Add new • ';
    this.pageTitleEdit = 'Edit:';

    // Selectors
    this.nameInput = '#supplier_name';
    this.descriptionDiv = '#supplier_description';
    this.descriptionLangNavItemLink = lang => `${this.descriptionDiv} ul li a[data-locale='${lang}']`;
    this.descriptionIFrame = id => `#supplier_description_${id}_ifr`;
    this.homePhoneInput = '#supplier_phone';
    this.mobilePhoneInput = '#supplier_mobile_phone';
    this.addressInput = '#supplier_address';
    this.secondaryAddressInput = '#supplier_address2';
    this.postalCodeInput = '#supplier_post_code';
    this.cityInput = '#supplier_city';
    this.countryInput = '#supplier_id_country';
    this.stateInput = '#supplier_id_state';
    this.logoFileInput = '#supplier_logo';
    this.metaTitleLangButton = '#supplier_meta_title';
    this.metaTitleLangSpan = lang => 'div.dropdown-menu[aria-labelledby=\'supplier_meta_title\']'
      + ` span[data-locale='${lang}']`;
    this.metaTitleInput = id => `#supplier_meta_title_${id}`;
    this.metaDescriptionTextarea = id => `#supplier_meta_description_${id}`;
    this.metaKeywordsInput = id => `#supplier_meta_keyword_${id}-tokenfield`;
    this.enabledSwitchLabel = id => `label[for='supplier_is_enabled_${id}']`;
    // Selectors for Meta keywords
    this.taggableFieldDiv = lang => `div.input-group div.js-locale-${lang}`;
    this.deleteKeywordLink = lang => `${this.taggableFieldDiv(lang)} a.close`;
    this.saveButton = '.card-footer button';
  }

  /*
  Methods
   */

  /**
   * Create or edit Supplier
   * @param supplierData
   * @return {Promise<void>}
   */
  async createEditSupplier(supplierData) {
    // Fill Name
    await this.setValue(this.nameInput, supplierData.name);
    // Fill Address information
    await this.setValue(this.homePhoneInput, supplierData.homePhone);
    await this.setValue(this.mobilePhoneInput, supplierData.mobilePhone);
    await this.setValue(this.addressInput, supplierData.address);
    await this.setValue(this.secondaryAddressInput, supplierData.secondaryAddress);
    await this.setValue(this.postalCodeInput, supplierData.postalCode);
    await this.setValue(this.cityInput, supplierData.city);
    await this.setValue(this.countryInput, supplierData.country);
    // Add logo
    await this.generateAndUploadImage(this.logoFileInput, supplierData.logo);

    // Fill Description, meta title, meta description and meta keywords in english
    await this.changeLanguageForSelectors('en');
    await this.setValueOnTinymceInput(this.descriptionIFrame(1), supplierData.description);
    await this.setValue(this.metaTitleInput(1), supplierData.metaTitle);
    await this.setValue(this.metaDescriptionTextarea(1), supplierData.metaDescription);
    // delete Keywords and other new ones
    await this.deleteKeywords('en');
    await this.addKeywords(supplierData.metaKeywords, 1);

    // Fill Description, meta title, meta description and meta keywords in french
    await this.changeLanguageForSelectors('fr');
    await this.setValueOnTinymceInput(this.descriptionIFrame(2), supplierData.descriptionFr);
    await this.setValue(this.metaTitleInput(2), supplierData.metaTitleFr);
    await this.setValue(this.metaDescriptionTextarea(2), supplierData.metaDescriptionFr);
    // delete Keywords and other new ones
    await this.deleteKeywords('fr');
    await this.addKeywords(supplierData.metaKeywords, 2);

    // set enabled value
    if (supplierData.enabled) {
      await this.page.click(this.enabledSwitchLabel(1));
    } else {
      await this.page.click(this.enabledSwitchLabel(0));
    }

    // Save Supplier
    await this.clickAndWaitForNavigation(this.saveButton);
    return this.getTextContent(this.alertSuccessBlockParagraph);
  }

  /**
   * Delete all keywords
   * @param lang, to specify which input to empty
   * @return {Promise<void>}
   */
  async deleteKeywords(lang = 'en') {
    const closeButtons = await this.page.$$(this.deleteKeywordLink(lang));
    /* eslint-disable no-restricted-syntax */
    for (const closeButton of closeButtons) {
      await closeButton.click();
    }
    /* eslint-enable no-restricted-syntax */
  }

  /**
   * Add keywords
   * @param keywords, array of keywords
   * @param idLang, to choose which lang (1 for en, 2 for fr)
   * @return {Promise<void>}
   */
  async addKeywords(keywords, idLang = 1) {
    /* eslint-disable no-restricted-syntax */
    for (const keyword of keywords) {
      await this.page.type(this.metaKeywordsInput(idLang), keyword);
      await this.page.keyboard.press('Enter');
    }
    /* eslint-enable no-restricted-syntax */
  }

  /**
   * change language for description and meta selectors
   * @param lang
   * @return {Promise<void>}
   */
  async changeLanguageForSelectors(lang = 'en') {
    // Change language for Description input
    await Promise.all([
      this.page.click(this.descriptionLangNavItemLink(lang)),
      this.waitForVisibleSelector(`${this.descriptionLangNavItemLink(lang)}.active`),
    ]);
    // Change language for meta selectors
    await Promise.all([
      this.page.click(this.metaTitleLangButton),
      this.waitForVisibleSelector(`${this.metaTitleLangButton}[aria-expanded='true']`),
    ]);
    await Promise.all([
      this.page.click(this.metaTitleLangSpan(lang)),
      this.waitForVisibleSelector(`${this.metaTitleLangButton}[aria-expanded='false']`),
    ]);
  }
};
