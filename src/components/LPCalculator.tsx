import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const InputWithTooltip = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  tooltipContent 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 flex items-center">
        {label}
        {tooltipContent && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="ml-2 w-4 h-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

const LPCalculator = () => {
  const [inputs, setInputs] = useState({
    token1Price: '0.7110',
    token2Price: '2500',
    totalLiquidity: '10000',
    upperBound: '4.44',
    lowerBound: '4.44',
    token1Symbol: 'S',
    token2Symbol: 'WETH'
  });

  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const validateInputs = () => {
    const errors = [];

    // Validate token prices
    if (isNaN(parseFloat(inputs.token1Price)) || parseFloat(inputs.token1Price) <= 0) {
      errors.push('Token 1 price must be a positive number');
    }
    if (isNaN(parseFloat(inputs.token2Price)) || parseFloat(inputs.token2Price) <= 0) {
      errors.push('Token 2 price must be a positive number');
    }

    // Validate total liquidity
    if (isNaN(parseFloat(inputs.totalLiquidity)) || parseFloat(inputs.totalLiquidity) <= 0) {
      errors.push('Total liquidity must be a positive number');
    }

    // Validate bounds
    if (isNaN(parseFloat(inputs.upperBound)) || parseFloat(inputs.upperBound) < 0) {
      errors.push('Upper bound must be a non-negative number');
    }
    if (isNaN(parseFloat(inputs.lowerBound)) || parseFloat(inputs.lowerBound) < 0) {
      errors.push('Lower bound must be a non-negative number');
    }

    // Validate symbols
    if (!inputs.token1Symbol.trim()) {
      errors.push('Token 1 symbol is required');
    }
    if (!inputs.token2Symbol.trim()) {
      errors.push('Token 2 symbol is required');
    }

    return errors;
  };

  const calculatePositions = (token1PriceUSD, token2PriceUSD, totalValue) => {
    // Calculate token amounts based on 50-50 USD value split
    const valuePerSide = totalValue / 2;
    
    const token1Amount = valuePerSide / token1PriceUSD;
    const token2Amount = valuePerSide / token2PriceUSD;
    
    // Calculate hedge amounts (50% of each position)
    const token1Hedge = token1Amount / 2;
    const token2Hedge = token2Amount / 2;
    
    return {
      token1Amount,
      token2Amount,
      token1ValueUSD: token1Amount * token1PriceUSD,
      token2ValueUSD: token2Amount * token2PriceUSD,
      token1Hedge,
      token2Hedge,
      pairPrice: token1PriceUSD / token2PriceUSD
    };
  };

  const handleCalculate = () => {
    try {
      // Validate inputs first
      const validationErrors = validateInputs();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('. '));
      }

      const token1PriceUSD = parseFloat(inputs.token1Price);
      const token2PriceUSD = parseFloat(inputs.token2Price);
      const totalValue = parseFloat(inputs.totalLiquidity);
      const upperPct = parseFloat(inputs.upperBound);
      const lowerPct = parseFloat(inputs.lowerBound);

      const positions = calculatePositions(token1PriceUSD, token2PriceUSD, totalValue);
      const pairPrice = positions.pairPrice;
      
      setResults({
        ...positions,
        priceRange: {
          lower: pairPrice * (1 - lowerPct/100),
          current: pairPrice,
          upper: pairPrice * (1 + upperPct/100)
        }
      });
      setError('');
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Token Pair LP Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <InputWithTooltip
                label="Token 1 Symbol"
                value={inputs.token1Symbol}
                onChange={(e) => setInputs(prev => ({ ...prev, token1Symbol: e.target.value }))}
                placeholder="S"
                tooltipContent="The symbol of the first token in the trading pair"
              />
              <InputWithTooltip
                label="Token 2 Symbol"
                value={inputs.token2Symbol}
                onChange={(e) => setInputs(prev => ({ ...prev, token2Symbol: e.target.value }))}
                placeholder="WETH"
                tooltipContent="The symbol of the second token in the trading pair"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <InputWithTooltip
                label={`${inputs.token1Symbol} Price (USD)`}
                type="number"
                value={inputs.token1Price}
                onChange={(e) => setInputs(prev => ({ ...prev, token1Price: e.target.value }))}
                placeholder="0.7110"
                tooltipContent="Current market price of the first token in USD"
              />
              <InputWithTooltip
                label={`${inputs.token2Symbol} Price (USD)`}
                type="number"
                value={inputs.token2Price}
                onChange={(e) => setInputs(prev => ({ ...prev, token2Price: e.target.value }))}
                placeholder="2500"
                tooltipContent="Current market price of the second token in USD"
              />
            </div>

            <InputWithTooltip
              label="Total Liquidity (USD)"
              type="number"
              value={inputs.totalLiquidity}
              onChange={(e) => setInputs(prev => ({ ...prev, totalLiquidity: e.target.value }))}
              placeholder="10000"
              tooltipContent="Total value of liquidity you want to provide to the trading pair"
            />

            <div className="grid grid-cols-2 gap-2">
              <InputWithTooltip
                label="Upper Bound (%)"
                type="number"
                value={inputs.upperBound}
                onChange={(e) => setInputs(prev => ({ ...prev, upperBound: e.target.value }))}
                placeholder="4.44"
                tooltipContent="Percentage range above the current price for the liquidity position"
              />
              <InputWithTooltip
                label="Lower Bound (%)"
                type="number"
                value={inputs.lowerBound}
                onChange={(e) => setInputs(prev => ({ ...prev, lowerBound: e.target.value }))}
                placeholder="4.44"
                tooltipContent="Percentage range below the current price for the liquidity position"
              />
            </div>

            <Button className="w-full" onClick={handleCalculate}>Calculate</Button>

            {results && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <h3 className="font-medium mb-2">Position Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>{inputs.token1Symbol} Amount: {results.token1Amount.toFixed(4)} (${results.token1ValueUSD.toFixed(2)})</p>
                    <p>{inputs.token2Symbol} Amount: {results.token2Amount.toFixed(4)} (${results.token2ValueUSD.toFixed(2)})</p>
                    <p className="font-bold">Optimal {inputs.token1Symbol} Hedge: {results.token1Hedge.toFixed(4)} tokens</p>
                    <p className="font-bold">Optimal {inputs.token2Symbol} Hedge: {results.token2Hedge.toFixed(4)} tokens</p>
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <h3 className="font-medium mb-1">Price Range ({inputs.token1Symbol}/{inputs.token2Symbol})</h3>
                  <div className="space-y-2 text-sm">
                    <p>Lower: {results.priceRange.lower.toFixed(6)}</p>
                    <p>Current: {results.priceRange.current.toFixed(6)}</p>
                    <p>Upper: {results.priceRange.upper.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LPCalculator;