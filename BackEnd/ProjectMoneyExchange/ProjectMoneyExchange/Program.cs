using Microsoft.EntityFrameworkCore;
using ProjectMoneyExchange.Data;



var builder = WebApplication.CreateBuilder(args);
// Configurar Entity Framework Core con SQL Server
builder.Services.AddDbContext<AplicacionDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Configurar CORS para permitir peticiones desde el frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()   // Permitir cualquier origen (dominio)
              .AllowAnyMethod()   // Permitir cualquier método (GET, POST, etc.)
              .AllowAnyHeader();  // Permitir cualquier header
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
// Aplicar la política de CORS
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

app.Run();

