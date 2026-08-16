<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_todas_as_tabelas_de_dominio_existem(): void
    {
        $tables = [
            'utilizadores',
            'provincias',
            'municipios',
            'distritos',
            'disponibilidade_distrito',
            'tipos_residuos',
            'contratos',
            'contrato_dias_semana',
            'parcelas_mensalidades',
            'motoristas',
            'veiculos',
            'agendamentos_recolha',
        ];

        foreach ($tables as $table) {
            $this->assertTrue(Schema::hasTable($table), "A tabela {$table} não existe.");
        }
    }

    public function test_colunas_chave_das_tabelas_existem(): void
    {
        $columns = [
            'utilizadores' => ['nome', 'email', 'password', 'role', 'tipo_cliente', 'nif', 'telefone', 'endereco_principal', 'bloqueado', 'motivo_bloqueio'],
            'provincias' => ['nome'],
            'municipios' => ['provincia_id', 'nome'],
            'distritos' => ['municipio_id', 'nome'],
            'disponibilidade_distrito' => ['distrito_id', 'dia_semana'],
            'tipos_residuos' => ['nome', 'descricao', 'preco_unitario_recolha', 'taxa_adesao'],
            'contratos' => [
                'cliente_id',
                'distrito_id',
                'tipo_residuo_id',
                'taxa_adesao',
                'valor_mensal',
                'valor_total',
                'frequencia_semanal',
                'duracao_meses',
                'estado',
                'latitude',
                'longitude',
                'rua',
                'ponto_referencia',
            ],
            'contrato_dias_semana' => ['contrato_id', 'dia_semana'],
            'parcelas_mensalidades' => [
                'contrato_id',
                'numero_parcela',
                'valor',
                'data_vencimento',
                'estado',
                'data_pagamento',
                'data_due',
                'registado_por_id',
                'numero_recibo',
            ],
            'motoristas' => ['utilizador_id', 'numero_carta'],
            'veiculos' => ['matricula', 'modelo', 'motorista_id'],
            'agendamentos_recolha' => ['contrato_id', 'motorista_id', 'data_recolha', 'estado', 'observacao'],
        ];

        foreach ($columns as $table => $tableColumns) {
            foreach ($tableColumns as $column) {
                $this->assertTrue(
                    Schema::hasColumn($table, $column),
                    "A coluna {$column} não existe na tabela {$table}."
                );
            }
        }
    }
}
