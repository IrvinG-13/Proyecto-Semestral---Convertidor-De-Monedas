using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore;
using ProjectMoneyExchange.Models;
using ProjectMoneyExchange.Models.ModelosAPIS;

namespace ProjectMoneyExchange.Data
{
    public class AplicacionDbContext : DbContext
    {
        public AplicacionDbContext(DbContextOptions<AplicacionDbContext> options) : base(options)  
        {
            // Este constructor es necesario para la inyección de dependencias

        }

        public required DbSet<ModeloBilletera> modeloBilleteras { get; set; }
        public required DbSet<ModeloUsuario> modeloUsuarios { get; set; }

        public required DbSet<ModeloSaldoBilletera> modeloSaldoBilletera { get; set; }

        

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            /////////////////////////////
            //CREACION DE TABLA USUARIO//
            /////////////////////////////
            modelBuilder.Entity<ModeloUsuario>(entity =>
            {
                //Nombre de la tabla USUARIO
                entity.ToTable("USUARIO");
                //LLave primaria
                entity.HasKey( e => e.Correo_User);
                //configuracion de la llave primaria generada Por correo de la persona
                entity.Property(e => e.Correo_User).IsRequired().HasMaxLength(50);

                //Configuracion propiedades requeridas
                entity.Property(e => e.Nombre_User).IsRequired().HasMaxLength(25);

                entity.Property(e => e.Apellido_User).IsRequired().HasMaxLength(25);

                entity.Property(e => e.Contraseña_User).IsRequired().HasMaxLength(50);

                entity.Property(e => e.Perfil_User).IsRequired(false).HasMaxLength(50);

            });

            /////////////////////////////////
            //CREACION DE TABLA MOVIMIENTO//
            ////////////////////////////////
            modelBuilder.Entity<ModeloBilletera>( entity =>
            {
                //Nombre de la tabla MOVIMIENTO
                entity.ToTable("MOVIMIENTO");

                //LLave primaria
                entity.HasKey(e => e.ID_Movimiento);

                //Configuracion de la llave primaria a que se genere automaticamente
                entity.Property(e => e.ID_Movimiento).ValueGeneratedOnAdd();

                //Llave Foranea relacionada con la Collection
                entity.HasOne(e => e.ModeloSaldoBilletera).WithMany(u => u.ModeloBilletera).HasForeignKey(e => e.ID_Billetera).OnDelete(DeleteBehavior.Restrict); //WithMany: muchas FK

                // Configuracion de la fecha
                entity.Property(e => e.FechaRegistro).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                
                // Configurar propiedades requeridas
                entity.Property(e => e.Monto) .IsRequired().HasColumnType("decimal(18,2)"); // configuracion mas precisa del dinero

                entity.Property(e => e.TipoMovimiento).IsRequired().HasMaxLength(10); // "Ingreso" o "Gasto"

                entity.Property(e => e.Categoria).IsRequired().HasMaxLength(100); //Electronico,Supermercado,Juguetes.

                entity.Property(e => e.RegistroMoneda).HasMaxLength(10);// EUR,USD,YEN,COP.

                entity.Property(e => e.RegistroSaldo).IsRequired().HasColumnType("decimal(18,2)");

                entity.Property(e=> e.NewRegistroMoneda).HasMaxLength(10);// EUR,USD pero del saldo nuevo

            });


            /////////////////////////////////////////
            /////  CREACION DE TABLA BILLETERA
            /////////////////////////////////////////

            modelBuilder.Entity<ModeloSaldoBilletera>(entity =>
            {
                //Nombre de la tabla BILLETERA
                entity.ToTable("BILLETERA");

                //Llave primaria
                entity.HasKey(e => e.ID_Billetera);

                //Configuracion de la llave primaria que se genera automaticamente
                entity.Property(e => e.ID_Billetera).ValueGeneratedOnAdd();

                //Configuracion de propiedades requeridas
                entity.Property(e => e.Saldo_Disponible).IsRequired().HasColumnType("decimal(18,2)");

                entity.Property(e => e.MonedaActual).IsRequired().HasMaxLength(3);

                //Llave foranea 
                entity.HasOne(e => e.ModeloUsuario).WithOne(u => u.ModeloSaldoBilletera).HasForeignKey<ModeloSaldoBilletera>(e => e.Correo_User).OnDelete(DeleteBehavior.Restrict);

                


            });

        }
    }
}
