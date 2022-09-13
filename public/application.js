$(document).ready(function() {
  // remove the url params like notice=message so they don't stick around
  window.history.replaceState(
    "object or string",
    "Coverband",
    window.location.href.replace(/notice=.*/, "")
  );
  $(".notice")
    .delay(3000)
    .fadeOut("slow");

  $(".del").click(function() {
    if (!confirm("Do you want to delete")) {
      return false;
    }
  });

  // Configuration for fancy sortable tables for source file groups
  $(".file_list").dataTable({
    aaSorting: [[1, "asc"]],
    bPaginate: false,
    bJQueryUI: true,
    aoColumns: [
      null,
      { sType: "percent" },
      { sType: "percent" },
      null,
      null,
      null,
      null,
      null,
      null
    ]
  });

  // Syntax highlight all files up front - deactivated
  // $('.source_table pre code').each(function(i, e) {hljs.highlightBlock(e, '  ')});

  // Syntax highlight source files on first toggle of the file view popup
  $("a.src_link").click(function() {
    // Get the source file element that corresponds to the clicked element
    var source_table = $($(this).attr("href"));
    var loader_url = $(source_table).attr("data-loader-url");

    $(source_table).load(loader_url);

    // If not highlighted yet, do it!
    if (!source_table.hasClass("highlighted")) {
      source_table.find("pre code").each(function(i, e) {
        hljs.highlightBlock(e, "  ");
      });
      source_table.addClass("highlighted");
    }
  });

  var prev_anchor;
  var curr_anchor;

  // Set-up of popup for source file views
  $("a.src_link").colorbox({
    transition: "none",
    inline: true,
    opacity: 1,
    width: "95%",
    height: "95%",
    onLoad: function() {
      prev_anchor = curr_anchor ? curr_anchor : jQuery.url.attr("anchor");
      curr_anchor = this.href.split("#")[1];
      window.location.hash = curr_anchor;
    },
    onCleanup: function() {
      if (prev_anchor && prev_anchor != curr_anchor) {
        $('a[href="#' + prev_anchor + '"]').click();
        curr_anchor = prev_anchor;
      } else {
        $(".group_tabs a:first").click();
        prev_anchor = curr_anchor;
        curr_anchor = $(".group_tabs a:first").attr("href");
      }
      window.location.hash = curr_anchor;
    }
  });

  window.onpopstate = function(event) {
    if (location.hash.substring(0, 2) == "#_") {
      $.colorbox.close();
      curr_anchor = jQuery.url.attr("anchor");
    } else {
      if ($("#colorbox").is(":hidden")) {
        $('a.src_link[href="' + location.hash + '"]').colorbox({ open: true });
      }
    }
  };

  // Hide src files and file list container after load
  $(".source_files").hide();
  $(".file_list_container").hide();

  // Add tabs based upon existing file_list_containers
  $(".file_list_container h2").each(function() {
    var container_id = $(this)
      .parent()
      .attr("id");
    var group_name = $(this)
      .find(".group_name")
      .first()
      .html();
    var covered_percent = $(this)
      .find(".covered_percent")
      .first()
      .html();

    $(".group_tabs").append(
      '<li><a href="#' +
        container_id +
        '">' +
        group_name +
        " (" +
        covered_percent +
        ")</a></li>"
    );
  });

  $(".group_tabs a").each(function() {
    $(this).addClass(
      $(this)
        .attr("href")
        .replace("#", "")
    );
  });

  // Make sure tabs don't get ugly focus borders when active
  $(".group_tabs a").live("focus", function() {
    $(this).blur();
  });

  var favicon_path = $('link[rel="shortcut icon"]').attr("href");
  $(".group_tabs a").live("click", function() {
    if (
      !$(this)
        .parent()
        .hasClass("active")
    ) {
      $(".group_tabs a")
        .parent()
        .removeClass("active");
      $(this)
        .parent()
        .addClass("active");
    }
    $(".file_list_container").hide();
    $(".file_list_container" + $(this).attr("href")).show();
    window.location.href =
      window.location.href.split("#")[0] +
      $(this)
        .attr("href")
        .replace("#", "#_");

    // Force favicon reload - otherwise the location change containing anchor would drop the favicon...
    // Works only on firefox, but still... - Anyone know a better solution to force favicon on local file?
    $('link[rel="shortcut icon"]').remove();
    $("head").append(
      '<link rel="shortcut icon" type="image/png" href="' +
        favicon_path +
        '" />'
    );
    return false;
  });

  if (jQuery.url.attr("anchor")) {
    var anchor = jQuery.url.attr("anchor");
    // source file hash
    if (anchor.length == 40) {
      $("a.src_link[href=#" + anchor + "]").click();
    } else {
      if ($(".group_tabs a." + anchor.replace("_", "")).length > 0) {
        $(".group_tabs a." + anchor.replace("_", "")).click();
      }
    }
  } else {
    $(".group_tabs a:first").click();
  }

  $("abbr.timeago").timeago();
  $("#loading").fadeOut();
  $("#wrapper").show();
  $(".dataTables_filter input").focus();

  const relevant = +Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(
    ([...document.querySelectorAll('table.file_list tbody td:nth-child(7)')]
      .map((node) => +node.innerHTML)
      .reduce((cur, val) => {
        return (cur ?? 0) + val;
      }, 0) /
      [...document.querySelectorAll('table.file_list tbody td:nth-child(5)')]
        .map((node) => +node.innerHTML)
        .reduce((cur, val) => {
          return (cur ?? 0) + val;
        }, 0)) *
      100
  );

  var clone = document.querySelector('#Coverage h2').cloneNode(true);
  clone.querySelector('.group_name').innerHTML = 'Relevant';
  clone.querySelector('.covered_percent > *').innerHTML = relevant + '%';
  clone.querySelector('.covered_strength').remove();
  clone.innerHTML = clone.innerHTML
    .replace('covered at', 'covered')
    .replace(' hits/line)', ')')
    .trim();
  document.querySelector('#Coverage h2').insertAdjacentElement('afterend', clone);
});
