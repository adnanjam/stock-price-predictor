define("placera/components/base/base", [], function() {
  /**
   * Includes some utility functions for all controllers.
   */

  $.Controller.extend(
    "Placera.Base",
    /* @static */
    {},
    /* @prototype */
    {
      init: function(el, options) {
        // keep empty
      },

      handleErrors: function(errors, context) {
        if (!context) {
          context = this.element;
        }

        $.each(errors, function(index) {
          var input = context.find(
              'input[name="' + index + '"], textarea[name="' + index + '"]'
            ),
            attr = errors[index][0],
            msg = input[0].getAttribute("data-error-" + attr);

          if (!input.hasClass("error")) {
            input.addClass("error");

            if (!msg) {
              msg = attr;
            }

            var html = '<div class="errorMsg">' + msg + "</div>";

            input.parent().append(html);
          }
        });
      },

      clearErrors: function() {
        this.element.find(".errorMsg").remove();
        this.element
          .find("input, textarea")
          .filter(".error")
          .removeClass("error");
      },

      // cache element in the controller and map to correct property name
      getCachedElement: function(selector, propertyName) {
        if (!this[propertyName]) {
          this[propertyName] = this.element.find(selector);
        }
      }
    }
  );
});

define("placera/models/base", [], function() {
  $.Model.extend(
    "Placera.Models",
    /* @Static */
    {
      //
      init: function() {},

      // general ajax post method
      doPost: function(params, success, error) {
        return $.ajax({
          url: params.url,
          type: "POST",
          success: function(data, status, jqXHR) {
            if (typeof success == "function") {
              success({
                input: params,
                output: data,
                jqXHR: jqXHR
              });
            }
          },
          error: function(jqXHR) {
            if (typeof error == "function") {
              var data;

              try {
                data = jQuery.parseJSON(jqXHR.responseText);
              } catch (ex) {
                data = jqXHR.responseText;
              }

              error({
                input: params,
                output: data,
                jqXHR: jqXHR
              });
            }
          },
          data: params.data,
          contentType: params.contentType,
          dataType: params.dataType,
          async: params.async
        });
      },

      // general ajax get method
      doGet: function(params, success, error) {
        $.ajax({
          url: params.url,
          type: params.type ? params.type : "GET",
          success: function(data, status, jqXHR) {
            if (typeof success == "function") {
              success({
                input: params,
                output: data,
                jqXHR: jqXHR
              });
            }
          },
          error: function(jqXHR) {
            if (typeof error == "function") {
              var data;

              try {
                data = jQuery.parseJSON(jqXHR.responseText);
              } catch (ex) {
                data = jqXHR.responseText;
              }

              error({
                input: params,
                output: data,
                jqXHR: jqXHR
              });
            }
          },
          data: params.data,
          async: params.async
        });
      }
    },
    /* @Prototype */
    {
      /**
       * Clear all model attributes
       */

      clearAttributes: function() {
        var tmpAttrs = this.attrs(),
          prop;

        for (prop in tmpAttrs) {
          delete this[prop];
        }
      }
    }
  );
});

define("forum/components/forumpage/forumpage", [
  "placera/components/base/base",
  "placera/models/base"
], function() {
  // general forum page stuff

  Placera.Base.extend(
    "Placera.Forumpage",
    /* @static */

    {
      defaults: {}
    },
    /* @prototype */

    {
      init: function() {
        //
      },

      ".reportUserPost click": function(el, ev) {
        ev.preventDefault();

        var reportDialog = el.next(".reportUserPostDialog");

        reportDialog.removeClass("hide");
        reportDialog
          .find("textarea")
          .val("")
          .focus();
      },

      ".cancelReportUserPostDialog click": function(el, ev) {
        ev.preventDefault();
        el.closest(".reportUserPostDialog").addClass("hide");
      },

      ".reportUserPostDialog form submit": function(el, ev) {
        ev.preventDefault();

        var self = this,
          params = {
            url: el[0].getAttribute("action"),
            data: el.formParams()
          };

        Placera.Models.doPost(
          params,
          function(response) {
            el.closest(".reportUserPostDialog").addClass("hide");
            el.closest("li").remove();
          },
          function(response) {
            self.handleErrors(response.output, el);
          }
        );
      },

      ".hideShowOverview click": function(el, ev) {
        var showStatus = !el.hasClass("arrowUp"),
          params = {
            url: "/forum/user-preferences/show-overview",
            data: {
              show: showStatus
            }
          };

        Placera.Models.doPost(params);
      },

      ".getCompanyForum click": function(el, ev) {
        ev.preventDefault();

        var url = el[0].getAttribute("href"),
          encodeChar = url.slice(-1),
          params = {
            url: url.replace(/.{1}$/, encodeURIComponent(encodeChar))
          };

        Placera.Models.doGet(params, this.proxy("getCompanyForumSuccess"));
      },

      ".editPost click": function(el, ev) {
        ev.preventDefault();

        var $userPost = el.closest(".userPostWrapper");

        if (!$userPost.hasClass("placera_editpost")) {
          require(["forum/components/editpost/editpost"], function() {
            $userPost.placera_editpost();
          });
        }
      },

      getCompanyForumSuccess: function(response) {
        var table = this.element.find(".companyForumTable"),
          tbody = table.find("tbody");

        table.removeClass("hide");

        while (tbody[0].firstChild) {
          tbody[0].removeChild(tbody[0].firstChild);
        }

        tbody.append(response.output);
      },

      "#pageSizeSelect change": function(el, ev) {
        var pageSize = el[0].options[el[0].selectedIndex].value,
          params = {
            url: "/forum/user-preferences/posts-per-page",
            data: {
              posts: pageSize
            }
          };

        Placera.Models.doPost(params, function(response) {
          el.closest(".forumPagerForm").submit();
        });
      },

      ".ajaxPager click": function(el, ev) {
        ev.preventDefault();

        var params = {
          url: el[0].getAttribute("href")
        };

        Placera.Models.doGet(params, function(response) {
          var newContent = el.closest(".forumTablePagerContent");
          newContent[0].innerHTML = "";
          newContent.append(response.output);
        });
      },

      postAndReloadPage: function(el) {
        var params = {
          url: el[0].getAttribute("href")
        };

        Placera.Models.doPost(params, this.proxy("postAndReloadSuccess"));
      },

      postAndReloadSuccess: function(response) {
        location.reload(true);
      }
    }
  );
});

define("forum/forum", function() {});
