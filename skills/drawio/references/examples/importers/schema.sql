CREATE TABLE public.users (
  id INT PRIMARY KEY
);

CREATE TABLE sales.orders (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  CONSTRAINT orders_user_fk
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);
