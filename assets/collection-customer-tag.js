document.addEventListener("DOMContentLoaded", () => {
  const customerTagsElement = document.querySelector("[data-customer-tags]");
  if (customerTagsElement) {
    const sectionElement = document.querySelector('[id^="shopify-section-"][id*="product-grid"]');
    if (sectionElement) {
      const sectionId = sectionElement.id;
      const sectionClasses = sectionElement.className;
      const customerTags = customerTagsElement.dataset.customerTags;
      
      sectionElement.innerHTML = '';
      
      sectionElement.id = sectionId;
      sectionElement.className = sectionClasses;
      sectionElement.setAttribute('data-customer-tags', customerTags);
  
      new CollectionFiltering();
    }
  }  
});
  
class CollectionFiltering {
    constructor() {
      this.filterData = [];
      const sectionElement = document.querySelector('[id^="shopify-section-"][id*="product-grid"]');
      this.section = sectionElement;
      this.sectionId = sectionElement?.id.replace('shopify-section-', '');
      this.initialTotal = 0;
      this.init();
      this.hookIntoFacetFilters();
      this.hookIntoURLHash();
      this.hookIntoCreateSearchParams();
    }
  
    hookIntoFacetFilters() {
      const originalRenderProductCount = FacetFiltersForm.renderProductCount;
  
      FacetFiltersForm.renderProductCount = (html) => {
        originalRenderProductCount.call(FacetFiltersForm, html);
        const currentCount = this.getCurrentCount(document);
        this.updateProductCount(document, currentCount);
        this.cleanupPaginationUrls(document);
        
        // Handle active facets after render product count
        this.processActiveFacets();
      };
    }
  
    hookIntoURLHash() {
      FacetFiltersForm.updateURLHash = (searchParams) => {
        const params = new URLSearchParams(searchParams);
        const customerTagsElement = document.querySelector("[data-customer-tags]");
        
        if (customerTagsElement) {
          try {
            const customerTags = JSON.parse(customerTagsElement.dataset.customerTags);
            if (customerTags && customerTags.length > 0) {
              // Get all values of filter.p.tag
              const tagValues = params.getAll('filter.p.tag');
              
              // Remove customer tags from URL params
              customerTags.forEach(tag => {
                const tagIndex = tagValues.indexOf(tag.trim());
                if (tagIndex > -1) {
                  tagValues.splice(tagIndex, 1);
                }
              });

              // Remove all filter.p.tag
              params.delete('filter.p.tag');
              
              // Add back non-customer tags
              tagValues.forEach(tag => {
                if (!customerTags.includes(tag.trim())) {
                  params.append('filter.p.tag', tag);
                }
              });
            }
          } catch (error) {
            console.error("Error parsing customer tags:", error);
          }
        }

        // Push state with filtered params
        history.pushState(
          { searchParams }, 
          '', 
          `${window.location.pathname}${params.toString() && '?'.concat(params.toString())}`
        );
      };
    }
  
    cleanupPaginationUrls(doc) {
      // Clean up pagination URLs
      doc.querySelectorAll('.pagination__list a[href]').forEach(link => {
        const url = new URL(link.href);
        const params = new URLSearchParams(url.search);
        
        // Save all params except filter.p.tag
        const cleanParams = new URLSearchParams();
        params.forEach((value, key) => {
          if (key !== 'filter.p.tag') {
            cleanParams.append(key, value);
          }
        });
  
        // Update href with cleaned params
        const cleanSearch = cleanParams.toString();
        link.href = `${window.location.pathname}${cleanSearch ? '?' + cleanSearch : ''}`;
      });
    }
  
    async getInitialTotal() {
      // Fetch only with customer tags to get product count
      const url = new URL(`/collections/${window.location.pathname.split('/')[2]}`, window.location.origin);
      url.searchParams.set('section_id', this.sectionId);
      
      // Add customer tags
      this.filterData.forEach(tag => {
        url.searchParams.append('filter.p.tag', tag);
      });

      try {
        const response = await fetch(url.toString());
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const countElement = tempDiv.querySelector('#ProductCount');
        if (countElement) {
          const match = countElement.textContent.match(/(\d+)/);
          if (match && match[1]) {
            return parseInt(match[1], 10);
          }
        }
      } catch (error) {
        console.error("Error getting initial total:", error);
      }
      return 0;
    }
  
    async updateCollectionGrid() {
      try {
        // Get current URL
        const currentUrl = new URL(window.location.href);
        const currentParams = new URLSearchParams(currentUrl.search);
        
        // Create new URL with collection handle
        const url = new URL(`/collections/${window.location.pathname.split('/')[2]}`, window.location.origin);
        
        // Copy all current params
        currentParams.forEach((value, key) => {
          url.searchParams.append(key, value);
        });
        
        // Add section_id and customer tags
        url.searchParams.set('section_id', this.sectionId);
        this.filterData.forEach(tag => {
          url.searchParams.append('filter.p.tag', tag);
        });
  
        const response = await fetch(url.toString());
        let html = await response.text();
      
        // Clean up pagination URLs in HTML before render
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Update product count
        const currentCount = this.getCurrentCount(tempDiv);
        this.initialTotal = currentCount;
        this.updateProductCount(tempDiv, currentCount);
        
        // Clean up pagination URLs
        tempDiv.querySelectorAll('.pagination__list a[href]').forEach(link => {
          const url = new URL(link.href);
          const params = new URLSearchParams(url.search);
          
          const cleanParams = new URLSearchParams();
          params.forEach((value, key) => {
            if (key !== 'filter.p.tag') {
              cleanParams.append(key, value);
            }
          });
  
          const cleanSearch = cleanParams.toString();
          link.href = `${window.location.pathname}${cleanSearch ? '?' + cleanSearch : ''}`;
        });
  
        html = tempDiv.innerHTML;
  
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newSection = doc.querySelector(`#${this.section.id}`);
  
        if (newSection && this.section) {
          const safeContent = newSection.cloneNode(true);
          this.section.replaceWith(safeContent);
          this.section = safeContent;

          // Handle active facets after update collection grid
          this.processActiveFacets();

          // Check and fetch product count after render grid
          const hasOtherFilters = Array.from(currentParams.keys()).some(key => 
            key.startsWith('filter.') && key !== 'filter.p.tag'
          );
          
          if (hasOtherFilters) {
            // Fetch product count asynchronously
            this.getInitialTotal().then(total => {
              this.initialTotal = total;
              // Update product count with new total
              const currentCount = this.getCurrentCount(document);
              this.updateProductCount(document, currentCount);
            });
          }
        }
      } catch (error) {
        console.error("Error updating collection grid:", error);
      }
    }
  
    getCurrentCount(doc) {
      const countElement = doc.querySelector('#ProductCount');
      if (countElement) {
        const text = countElement.textContent;
        const numbers = text.match(/\d+/g);
        
        if (numbers && numbers.length > 0) {
          // If there is "個の商品" (Japanese)
          if (text.includes('個の商品')) {
            // Get the last number in the array
            return parseInt(numbers[numbers.length - 1], 10);
          }
          // Otherwise, get the first number as normal
          return parseInt(numbers[0], 10);
        }
      }
      return 0;
    }
  
    updateProductCount(doc, currentCount) {
      const desktopCount = doc.querySelector('#ProductCountDesktop');
      const mobileCount = doc.querySelector('#ProductCount');
      
      if (desktopCount || mobileCount) {
        let newText;
        if (this.initialTotal && currentCount !== this.initialTotal) {
          // Format for Japanese
          if (desktopCount?.textContent.includes('個の商品')) {
            newText = `${currentCount}個の商品の${this.initialTotal}`;
          } else {
            // Format for English
            newText = `${currentCount} of ${this.initialTotal} products`;
          }
        } else {
          // Format for Japanese
          if (desktopCount?.textContent.includes('個の商品')) {
            newText = `${currentCount}個の商品`;
          } else {
            // Format for English
            newText = `${currentCount} products`;
          }
        }
        
        if (desktopCount) desktopCount.textContent = newText;
        if (mobileCount) mobileCount.textContent = newText;
      }
    }
  
    init() {
      const customerTagsElement = document.querySelector("[data-customer-tags]");
      if (!customerTagsElement) return;
  
      try {
        const customerTags = JSON.parse(customerTagsElement.dataset.customerTags);
        const formattedTags = [
          ...new Set(customerTags.map((tag) => tag.trim())),
        ];
        this.filterData = formattedTags;
        this.updateCollectionGrid();
      } catch (error) {
        console.error("Error parsing customer tags:", error);
      }
    }

    processActiveFacets() {
      const customerTagsElement = document.querySelector("[data-customer-tags]");
      if (customerTagsElement) {
        try {
          const customerTags = JSON.parse(customerTagsElement.dataset.customerTags);
          if (customerTags && customerTags.length > 0) {
            // Mark filter tags
            document.querySelectorAll('.active-facets facet-remove').forEach(element => {
              const buttonInner = element.querySelector('.active-facets__button-inner');
              if (buttonInner) {
                const buttonText = buttonInner.textContent?.trim() || '';
                if (customerTags.some(tag => buttonText.includes(tag.trim()))) {
                  element.setAttribute('data-filter-tag', '');
                }
              }
            });

            // Check and hide/show Remove All button
            document.querySelectorAll('.active-facets').forEach(container => {
              const removeAllBtn = container.querySelector('.active-facets__button-wrapper');
              if (removeAllBtn) {
                const visibleFacets = container.querySelectorAll('facet-remove:not([data-filter-tag]):not(.active-facets__button-wrapper)');
                if (visibleFacets.length === 0) {
                  removeAllBtn.style.display = 'none';
                } else {
                  removeAllBtn.style.display = '';
                }
              }
            });
          }
        } catch (error) {
          console.error("Error parsing customer tags:", error);
        }
      }
    }

    hookIntoCreateSearchParams() {
      const originalCreateSearchParams = FacetFiltersForm.prototype.createSearchParams;
      
      FacetFiltersForm.prototype.createSearchParams = function(form) {
        const searchParams = new URLSearchParams(originalCreateSearchParams.call(this, form));
        
        // Add customer tags only if no filter.p.tag in searchParams
        if (!searchParams.has('filter.p.tag')) {
          const customerTagsElement = document.querySelector("[data-customer-tags]");
          if (customerTagsElement) {
            try {
              const customerTags = JSON.parse(customerTagsElement.dataset.customerTags);
              if (Array.isArray(customerTags) && customerTags.length > 0) {
                customerTags.forEach(tag => {
                  searchParams.append('filter.p.tag', tag.trim());
                });
              }
            } catch (error) {
              console.error("Error parsing customer tags:", error);
            }
          }
        }

        return searchParams.toString();
      };
    }
  }
  