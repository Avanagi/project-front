var select = document.getElementById('accounts-per-page');
for (let i = 3; i < 21; i++) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    select.appendChild(opt);
}

loadTableData(3, 0);

function onChange() {
    var selectValue = select.value;
    loadTableData(selectValue, 0);

    $(document).ready(function () {
        $.ajax({
            url: '/rest/players/count',
            method: 'GET',
            success: function (data) {
                usePlayersCount(data.toString(), selectValue);
            }
        });
    });
}

select.onchange = onChange;

$(document).ready(function () {
    onChange();
});

function usePlayersCount(playersCount, selectValue) {
    var paginationDiv = document.getElementById('pagination-buttons');
    paginationDiv.innerHTML = '';
    var totalPages = Math.ceil(playersCount / selectValue);

    for (let i = 1; i <= totalPages; i++) {
        var button = document.createElement('button');
        button.innerHTML = i;
        if (i === 1) {
            button.classList.add('active');
        }
        button.onclick = function () {
            var currentActive = paginationDiv.querySelector('.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            this.classList.add('active');
            loadTableData(selectValue, i - 1);
        };
        paginationDiv.appendChild(button);
    }
}

function loadTableData(limit, pageNumber) {
    $.ajax({
        url: `/rest/players?pageNumber=${pageNumber}&pageSize=${limit}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var tableBody = $('#table-main tbody');
            tableBody.empty();
            $.each(data, function (index, player) {
                var row = $('<tr>');
                row.append($('<td>').text(player.id));
                row.append($('<td>').text(player.name));
                row.append($('<td>').text(player.title));
                row.append($('<td>').text(player.race));
                row.append($('<td>').text(player.profession));
                row.append($('<td>').text(player.level));
                var birthday = new Date(player.birthday);
                var formattedDate = (birthday.getMonth() + 1) + '/' + birthday.getDate() + '/' + birthday.getFullYear();
                row.append($('<td>').text(formattedDate));
                row.append($('<td>').text(player.banned));

                var editButton = $('<button>').append($('<img>').attr('src', '/img/edit.png').attr('alt', 'Edit'));
                editButton.on('click', function () {
                    openEditModal(player);
                });
                row.append($('<td>').append(editButton));

                var deleteButton = $('<button>').append($('<img>').attr('src', '/img/delete.png').attr('alt', 'Delete'));
                deleteButton.on('click', function () {
                    $.ajax({
                        url: `/rest/players/${player.id}`,
                        method: 'DELETE',
                        success: function () {
                            row.remove();
                            console.log(`Player with ID ${player.id} has been deleted.`);
                        },
                        error: function () {
                            console.error(`Failed to delete player with ID ${player.id}.`);
                        }
                    });
                });
                row.append($('<td>').append(deleteButton));

                tableBody.append(row);
            });
        }
    });
}

function openEditModal(player) {
    var modal = $('#editModal');
    modal.find('input[name="name"]').val(player.name);
    modal.find('input[name="title"]').val(player.title);
    modal.find('select[name="race"]').val(player.race);
    modal.find('select[name="profession"]').val(player.profession);
    modal.find('input[name="banned"]').prop('checked', player.banned);

    modal.find('button.save').off('click').on('click', function () {
        var updatedPlayer = {
            name: modal.find('input[name="name"]').val(),
            title: modal.find('input[name="title"]').val(),
            race: modal.find('select[name="race"]').val(),
            profession: modal.find('select[name="profession"]').val(),
            banned: modal.find('input[name="banned"]').prop('checked')
        };

        $.ajax({
            url: `/rest/players/${player.id}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(updatedPlayer),
            success: function () {
                modal.modal('hide');
                loadTableData(select.value, 0);
            },
            error: function () {
                console.error(`Failed to update player with ID ${player.id}.`);
            }
        });
    });

    modal.modal('show');
}


function createAccount() {
    var form = $('#createAccountForm');
    var newPlayer = {
        name: form.find('input[name="name"]').val(),
        title: form.find('input[name="title"]').val(),
        race: form.find('select[name="race"]').val(),
        profession: form.find('select[name="profession"]').val(),
        level: parseInt(form.find('input[name="level"]').val(), 10),
        birthday: new Date(form.find('input[name="birthday"]').val()).getTime(),
        banned: form.find('input[name="banned"]').prop('checked') || false
    };

    $.ajax({
        url: '/rest/players',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newPlayer),
        success: function() {
            $('#createAccountModal').modal('hide');
            loadTableData(select.value, 0);
        },
        error: function() {
            console.error('Failed to create new player.');
        }
    });
}

