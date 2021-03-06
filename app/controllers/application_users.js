// Generated by CoffeeScript 1.6.2
(function() {
  jQuery(function($) {
    var _this = this;

    window.UserCard = Spine.Controller.create({
      elements: {
        ".name_field": "name",
        ".email_field": "email",
        ".color_field": "color",
        ".person-value": "title",
        ".user_image": "image"
      },
      proxied: ["render", "remove", "update_user", "cancel"],
      events: {
        "click .edituserbutton": "update_user",
        "click .front": "open",
        "click .person-delete": "delete_user",
        "click .cancelbutton": "cancel"
      },
      init: function() {
        return this.item.bind("destroy", this.remove);
      },
      render: function() {
        var elements;

        elements = $("#userTemplate").tmpl(User.find(this.item.id));
        this.el.html(elements);
        this.refreshElements();
        return this;
      },
      cancel: function() {
        return this.el.find(".person").trigger("flip");
      },
      open: function() {
        this.name.val(this.item.name);
        this.email.val(this.item.email);
        this.color.val(this.item.color);
        if (!this.el.find(".person").hasClass("flipped")) {
          $(".person.flipped").trigger("flip");
          return this.el.find(".person").trigger("flip");
        }
      },
      delete_user: function() {
        if (this.item.image != null) {
          if (UserImage.exists(this.item.image)) {
            UserImage.find(this.item.image).destroy();
          }
        }
        return this.item.destroy();
      },
      remove: function() {
        return this.el.remove();
      },
      update_user: function() {
        var i;

        this.item.updateAttributes({
          name: this.name.val(),
          email: this.email.val(),
          color: this.color.val()
        });
        this.item.save();
        this.title.html(this.item.name);
        if (window.has_user_image) {
          log("image called");
          window.has_user_image = false;
          i = UserImage.create({
            image: window.imageevent.target.result
          });
          i.save();
          this.item.image = i.id;
          this.item.save();
          this.image[0].style.background = 'url(' + window.imageevent.target.result + ') no-repeat center center';
        }
        return this.el.find(".person.flipped").trigger("flip");
      }
    });
    window.UserApp = Spine.Controller.create({
      elements: {
        "#users_div": "items"
      },
      events: {
        "click .useritem": "click",
        "dblclick .useritem": "edit_user_window",
        "click .useritem>span": "click",
        "click #add_user_button": "add_user_window"
      },
      proxied: ["render", "add_user", "edit_user", "addAll", "uploader_init"],
      init: function() {
        User.fetch();
        return this.addAll();
      },
      addAll: function() {
        var a, all_users, b, upload, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;

        all_users = User.all();
        $('#people-list').html("");
        $.each(all_users, function(key, value) {
          var card;

          card = UserCard.init({
            item: value
          });
          return $('#people-list').append(card.render().el);
        });
        _ref = $(".person");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          a = _ref[_i];
          $(a).gfxFlip({
            height: 247,
            width: 210
          });
        }
        _ref1 = $(".color_field");
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          b = _ref1[_j];
          $(b).ColorPicker({
            livePreview: true,
            onSubmit: function(hsb, hex, rgb, el) {
              $(el).val(hex);
              return $(el).ColorPickerHide();
            },
            change: function(hsb, hex, rgb) {
              alert("onchange");
              return $(this).ColorPickerSetColor(this.value);
            }
          });
        }
        _ref2 = $(".picture_field");
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          upload = _ref2[_k];
          _results.push(uploader_init(upload));
        }
        return _results;
      },
      click: function(e) {
        if ($(e.target).hasClass("useritem")) {
          $("#users_div .current").removeClass("current");
          return $(e.target).addClass("current");
        } else {
          $("#users_div .current").removeClass("current");
          return $(e.target).parent().addClass("current");
        }
      },
      add_user_window: function() {
        var card, newUser;

        newUser = User.create();
        card = UserCard.init({
          item: newUser
        });
        $('#people-list').append(card.render().el);
        card.el.find(".person").gfxFlip({
          height: 247,
          width: 210
        });
        card.el.find(".person").trigger("flip");
        return card.el.find(".color_field").ColorPicker({
          livePreview: true,
          color: '#00ff00',
          onSubmit: function(hsb, hex, rgb, el) {
            $(el).val(hex);
            return $(el).ColorPickerHide();
          }
        });
      },
      edit_user_window: function() {
        var curr_user, id;

        id = $("#users_div .current").attr("id");
        curr_user = User.find(id);
        $('#user_name').val(curr_user.name);
        $('#user_email').val(curr_user.email);
        $("#user_color").val(curr_user.color);
        return $("#dialog_adduser").dialog({
          modal: true,
          title: 'Edit User',
          dialogClass: "editing"
        });
      },
      add_user: function() {
        var color, email, name, newUser, setting_stuff;

        name = $('#user_name').val();
        email = $('#user_email').val();
        color = $("#user_color").val();
        newUser = User.create({
          name: name,
          email: email,
          color: color
        });
        this.addAll();
        $("#dialog_adduser").dialog("close");
        setting_stuff = Setting.all()[0];
        add_email_acl(email, setting_stuff.gmail, setting_stuff.password);
        $('#user_name').val("");
        $('#user_description').val("");
        return $("#user_color").val("");
      },
      edit_user: function() {
        var curr_user, id;

        id = $("#users_div .current").attr("id");
        curr_user = User.find(id);
        curr_user.updateAttributes({
          name: $('#user_name').val(),
          email: $('#user_email').val(),
          color: $("#user_color").val()
        });
        $('#user_name').val("");
        $('#user_description').val("");
        $("#user_color").val("");
        this.addAll();
        return $("#dialog_adduser").dialog("close");
      }
    });
    return window.UserLegendApp = Spine.Controller.create({
      elements: {
        "#gantt_legend": "items"
      },
      proxied: ["addAll"],
      addAll: function() {
        var all_users, element, user, _i, _len, _results;

        all_users = User.all();
        $('#gantt_legend').html("");
        _results = [];
        for (_i = 0, _len = all_users.length; _i < _len; _i++) {
          user = all_users[_i];
          element = $("#tagTmpl").tmpl(user);
          _results.push($('#gantt_legend').append(element));
        }
        return _results;
      }
    });
  });

  window.get_user = function(item) {
    User.fetch();
    if (User.exists(item.data.userid)) {
      return User.find(item.data.userid);
    }
  };

  window.get_image = function(image) {
    var a;

    if (UserImage.exists(image)) {
      a = UserImage.find(image);
      return a.image;
    } else {
      return "../images/default-person.gif";
    }
  };

  window.check_you = function(email) {
    if (CurrentUser.first().email === email) {
      return "(You)";
    } else {
      return "";
    }
  };

  window.uploader_init = function(upload) {
    return upload.onchange = function(e) {
      var file, reader;

      console.log("changed called");
      e.preventDefault();
      file = upload.files[0];
      reader = new FileReader();
      $(".person.flipped .picloader").show();
      reader.onload = (function(theFile) {
        return function(e) {
          console.log("reader.onload called");
          window.imageevent = event;
          window.has_user_image = true;
          return $(".person.flipped .picloader").hide();
        };
      })(file);
      reader.readAsDataURL(file);
      window.file = file;
      window.reader = reader;
      return false;
    };
  };

}).call(this);
