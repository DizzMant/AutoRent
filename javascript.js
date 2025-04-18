document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Модальное окно бронирования
    const modal = document.getElementById('bookingModal');
    const bookButtons = document.querySelectorAll('.book-button');

    // Закрытие всех модальных окон
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    bookButtons.forEach(button => {
        button.addEventListener('click', () => {
            const carModel = button.getAttribute('data-car');
            document.getElementById('carModel').value = carModel;
            modal.style.display = 'block';
        });
    });

    // Обработка формы бронирования
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
        modal.style.display = 'none';
        this.reset();
    });

    // Адаптивное меню
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    document.querySelector('.navbar .container').appendChild(menuToggle);

    menuToggle.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'block' ? 'none' : 'block';
    });

    // Админ-функционал
    let cars = JSON.parse(localStorage.getItem('cars')) || [];
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // Инициализация начальных данных
    if (cars.length === 0) {
        cars = [
            {
                id: 1,
                name: 'Audi A4',
                price: '2500',
                image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: 2,
                name: 'Hyundai Solaris',
                price: '1500',
                image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80'
            },
            {
                id: 3,
                name: 'Kia Rio',
                price: '1600',
                image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            }
        ];
        localStorage.setItem('cars', JSON.stringify(cars));
    }

    // Админ-кнопка
    const adminLink = document.createElement('a');
    adminLink.href = '#';
    adminLink.className = `admin-login ${isAdmin ? 'logout' : ''}`;
    adminLink.textContent = isAdmin ? 'Выйти' : 'Админ';
    document.querySelector('.navbar .container').appendChild(adminLink);

    // Обработчик кнопки админа/выхода
    adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        if(isAdmin) {
            sessionStorage.removeItem('isAdmin');
            location.reload();
        } else {
            document.getElementById('adminLoginModal').style.display = 'block';
        }
    });

    // Рендер автомобилей
    function renderCars() {
        const grid = document.querySelector('.cars-grid');
        grid.innerHTML = '';
        
        cars.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card';
            card.innerHTML = `
                <img src="${car.image}" alt="${car.name}">
                <h3>${car.name}</h3>
                <p>от ${car.price} ₽/сутки</p>
                <button class="book-button" data-car="${car.name}">Забронировать</button>
                ${isAdmin ? `
                    <div class="admin-controls">
                        <button class="edit-button" data-id="${car.id}">✏️</button>
                        <button class="delete-button" data-id="${car.id}">🗑️</button>
                    </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });

        if(isAdmin) {
            const addCard = document.createElement('div');
            addCard.className = 'car-card add-car';
            addCard.innerHTML = `<button class="add-button">+</button>`;
            grid.appendChild(addCard);
        }

        // Навешиваем обработчики
        document.querySelectorAll('.delete-button').forEach(btn => {
            btn.addEventListener('click', () => deleteCar(btn.dataset.id));
        });
        
        document.querySelectorAll('.edit-button').forEach(btn => {
            btn.addEventListener('click', () => editCar(btn.dataset.id));
        });
        
        document.querySelector('.add-button')?.addEventListener('click', showCarForm);
    }

    // Управление автомобилями
    function deleteCar(id) {
        if(confirm('Удалить автомобиль?')) {
            cars = cars.filter(car => car.id !== Number(id));
            localStorage.setItem('cars', JSON.stringify(cars));
            renderCars();
        }
    }

    function editCar(id) {
        const car = cars.find(c => c.id === Number(id));
        if(car) {
            document.getElementById('carName').value = car.name;
            document.getElementById('carPrice').value = car.price;
            document.getElementById('carImage').value = car.image;
            document.getElementById('carForm').dataset.id = car.id;
            document.getElementById('carModal').style.display = 'block';
        }
    }

    function showCarForm() {
        document.getElementById('carForm').reset();
        document.getElementById('carForm').removeAttribute('data-id');
        document.getElementById('carModal').style.display = 'block';
    }

    // Обработка формы автомобиля
    document.getElementById('carForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newCar = {
            id: this.dataset.id ? Number(this.dataset.id) : Date.now(),
            name: document.getElementById('carName').value,
            price: document.getElementById('carPrice').value,
            image: document.getElementById('carImage').value
        };

        if(this.dataset.id) {
            const index = cars.findIndex(c => c.id === Number(this.dataset.id));
            cars[index] = newCar;
        } else {
            cars.push(newCar);
        }
        
        localStorage.setItem('cars', JSON.stringify(cars));
        renderCars();
        document.getElementById('carModal').style.display = 'none';
    });

    // Авторизация администратора
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if(document.getElementById('adminPassword').value === 'admin123') {
            sessionStorage.setItem('isAdmin', 'true');
            document.getElementById('adminLoginModal').style.display = 'none';
            location.reload();
        } else {
            alert('Неверный пароль!');
        }
    });

    // Первоначальный рендер
    renderCars();
});